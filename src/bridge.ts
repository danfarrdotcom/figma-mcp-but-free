import WebSocket from 'ws';

export interface BridgeRequest {
  type: string;
  nodeIds?: string[];
  params?: Record<string, unknown>;
  requestId: string;
}

export interface BridgeResponse {
  requestId: string;
  data?: unknown;
  error?: string;
}

export interface BridgeConfig {
  port: number;
  host?: string;
  timeout?: number;
}

export class Bridge {
  private wss: WebSocket.Server | null = null;
  private ws: WebSocket | null = null;
  private config: BridgeConfig;
  private pendingRequests = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>();

  constructor(config: BridgeConfig) {
    this.config = { timeout: 30000, host: 'localhost', ...config };
  }
