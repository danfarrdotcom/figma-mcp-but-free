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

  async send(type: string, params: Record<string, unknown> = {}, nodeIds?: string[]): Promise<unknown> {
    if (!this.isConnected()) throw new Error('Not connected to Figma plugin');
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request ${type} timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);
      this.pendingRequests.set(requestId, { resolve, reject, timer });
      const msg: BridgeRequest = { type, params, nodeIds, requestId };
      this.ws!.send(JSON.stringify({ type: 'bridge-request', payload: msg }));
    });
  }

  private handleMessage(raw: string) {
    let msg: { type: string; payload: BridgeResponse | { type: string; data?: unknown } };
    try { msg = JSON.parse(raw); } catch { return; }
    if (msg.type === 'bridge-response' && 'requestId' in msg.payload) {
      const resp = msg.payload as BridgeResponse;
      const pending = this.pendingRequests.get(resp.requestId);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(resp.requestId);
        if (resp.error) pending.reject(new Error(resp.error));
        else pending.resolve(resp.data);
      }
    }
  }
