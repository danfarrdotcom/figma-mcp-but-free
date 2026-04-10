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
