import { randomUUID } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";

export interface BridgeRequest {
	type: string;
	requestId: string;
	nodeIds?: string[];
	params?: Record<string, unknown>;
}

export interface BridgeResponse {
	type?: string;
	requestId: string;
	data?: unknown;
	error?: string;
	progress?: number;
	message?: string;
}

interface PendingRequest {
	resolve: (resp: BridgeResponse) => void;
	reject: (err: Error) => void;
	timer: NodeJS.Timeout;
	type: string;
}

/**
 * Bridge manages the WebSocket connection from the Figma plugin.
 * Only one plugin connection is maintained at a time.
 */
export class Bridge {
	private wss: WebSocketServer | null = null;
	private conn: WebSocket | null = null;
	private pending = new Map<string, PendingRequest>();
	private readonly defaultTimeoutMs: number;
	private readonly heavyTimeoutMs: number;

	constructor() {
		this.defaultTimeoutMs = parseInt(
			process.env.FIGMA_BRIDGE_TIMEOUT_MS || "60000",
			10,
		);
		this.heavyTimeoutMs = parseInt(
			process.env.FIGMA_BRIDGE_HEAVY_TIMEOUT_MS || "180000",
			10,
		);
	}

	get connected(): boolean {
		return this.conn?.readyState === WebSocket.OPEN;
	}

	start(port: number): void {
		this.wss = new WebSocketServer({ port });
		this.wss.on("connection", (ws) => {
			if (this.conn && this.conn.readyState === WebSocket.OPEN) {
				this.conn.close(1000, "replaced");
				this.rejectAllPending("plugin connection replaced");
			}
			this.conn = ws;
			console.error(`[bridge] plugin connected`);

			ws.on("message", (raw) => {
				let resp: BridgeResponse;
				try {
					resp = JSON.parse(raw.toString()) as BridgeResponse;
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					console.error(`[bridge] invalid plugin response json: ${message}`);
					return;
				}

				// Progress update — extend timeout
				if (resp.progress && resp.requestId) {
					const entry = this.pending.get(resp.requestId);
					if (entry) {
						clearTimeout(entry.timer);
						entry.timer = setTimeout(
							() => this.timeout(resp.requestId),
							this.timeoutFor(entry.type),
						);
					}
					return;
				}

				if (!resp.requestId) return;

				const entry = this.pending.get(resp.requestId);
				if (!entry) return;
				this.pending.delete(resp.requestId);
				clearTimeout(entry.timer);
				entry.resolve(resp);
			});

			ws.on("close", () => {
				if (this.conn === ws) this.conn = null;
				this.rejectAllPending("plugin disconnected before responding");
				console.error(`[bridge] plugin disconnected`);
			});

			ws.on("error", (err) => {
				this.rejectAllPending(`websocket error: ${err.message}`);
				console.error(`[bridge] ws error: ${err.message}`);
			});
		});

		console.error(`[bridge] listening on ws://127.0.0.1:${port}`);
	}

	send(
		type: string,
		nodeIds?: string[],
		params?: Record<string, unknown>,
	): Promise<BridgeResponse> {
		if (!this.conn || this.conn.readyState !== WebSocket.OPEN) {
			return Promise.reject(
				new Error("Plugin not connected. Run the Figma plugin first."),
			);
		}

		const requestId = randomUUID().slice(0, 8);
		const timeout = this.timeoutFor(type);

		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => this.timeout(requestId), timeout);
			this.pending.set(requestId, { resolve, reject, timer, type });

			const req: BridgeRequest = { type, requestId, nodeIds, params };
			this.conn?.send(JSON.stringify(req));
		});
	}

	stop(): void {
		for (const [_id, entry] of this.pending) {
			clearTimeout(entry.timer);
			entry.reject(new Error("bridge shutting down"));
		}
		this.pending.clear();
		this.conn?.close();
		this.wss?.close();
	}

	private timeout(requestId: string): void {
		const entry = this.pending.get(requestId);
		if (!entry) return;
		this.pending.delete(requestId);
		entry.reject(
			new Error(
				`Request ${requestId} (${entry.type}) timed out after ${this.timeoutFor(entry.type)}ms`,
			),
		);
	}

	private timeoutFor(type: string): number {
		const heavyTools = new Set([
			"get_document",
			"get_screenshot",
			"save_screenshots",
			"export_frames_to_pdf",
			"scan_text_nodes",
			"scan_nodes_by_types",
			"search_nodes",
			"get_design_context",
			"export_tokens",
		]);
		return heavyTools.has(type) ? this.heavyTimeoutMs : this.defaultTimeoutMs;
	}

	private rejectAllPending(reason: string): void {
		for (const [requestId, entry] of this.pending) {
			clearTimeout(entry.timer);
			entry.reject(new Error(`Request ${requestId} (${entry.type}) failed: ${reason}`));
		}
		this.pending.clear();
	}
}
