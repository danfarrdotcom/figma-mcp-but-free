import { Bridge } from '../src/bridge.js';

describe('Bridge', () => {
  let bridge: Bridge;
  beforeEach(() => { bridge = new Bridge({ port: 0 }); });
  afterEach(() => { bridge.stop().catch(() => {}); });

  describe('connection', () => {
    it('starts disconnected', () => {
      expect(bridge.isConnected()).toBe(false);
    });
    it('reports connection info', () => {
      const info = bridge.getConnectionInfo();
      expect(info.connected).toBe(false);
      expect(info.pendingCount).toBe(0);
    });
  });

  describe('send', () => {
    it('throws when not connected', async () => {
      await expect(bridge.send('get_document')).rejects.toThrow('Not connected');
    });
  });

  describe('error handling', () => {
    it('rejects on invalid JSON gracefully', () => {
      expect(() => bridge['handleMessage']('not json')).not.toThrow();
    });
  });
});
