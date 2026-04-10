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
}
