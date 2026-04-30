import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";

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
}

/**
 * Bridge manages the WebSocket connection from the Figma plugin.
 * Only one plugin connection is maintained at a time.
 */
export class Bridge {
	private wss: WebSocketServer | null = null;
	private conn: WebSocket | null = null;
	private pending = new Map<string, PendingRequest>();

	get connected(): boolean {
		return this.conn?.readyState === WebSocket.OPEN;
	}

	start(port: number): void {
		this.wss = new WebSocketServer({ port });
		this.wss.on("connection", (ws) => {
			if (this.conn && this.conn.readyState === WebSocket.OPEN) {
				this.conn.close(1000, "replaced");
			}
			this.conn = ws;
			console.error(`[bridge] plugin connected`);

			ws.on("message", (raw) => {
				const resp: BridgeResponse = JSON.parse(raw.toString());

				// Progress update — extend timeout
				if (resp.progress && resp.requestId) {
					const entry = this.pending.get(resp.requestId);
					if (entry) {
						clearTimeout(entry.timer);
						entry.timer = setTimeout(
							() => this.timeout(resp.requestId),
							60_000,
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
				console.error(`[bridge] plugin disconnected`);
			});

			ws.on("error", (err) => {
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
		const timeout = type === "get_document" ? 60_000 : 30_000;

		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => this.timeout(requestId), timeout);
			this.pending.set(requestId, { resolve, reject, timer });

			const req: BridgeRequest = { type, requestId, nodeIds, params };
			this.conn!.send(JSON.stringify(req));
		});
	}

	stop(): void {
		for (const [id, entry] of this.pending) {
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
		entry.reject(new Error(`Request ${requestId} timed out`));
	}
}
