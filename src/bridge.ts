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

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wss = new WebSocket.Server({ port: this.config.port, host: this.config.host });
      this.wss.on('listening', () => resolve());
      this.wss.on('error', reject);
      this.wss.on('connection', (ws) => {
        this.ws = ws;
        ws.on('message', (raw) => this.handleMessage(raw.toString()));
        ws.on('close', () => { this.ws = null; });
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.wss?.close(() => resolve());
      this.wss = null;
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
