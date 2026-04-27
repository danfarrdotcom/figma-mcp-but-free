import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Bridge } from "../src/bridge.js";
import WebSocket, { WebSocketServer } from "ws";

describe("Bridge", () => {
  let bridge: Bridge;
  const PORT = 19940;

  beforeEach(() => {
    bridge = new Bridge();
    bridge.start(PORT);
  });

  afterEach(() => {
    bridge.stop();
  });

  it("reports disconnected when no plugin is connected", () => {
    expect(bridge.connected).toBe(false);
  });

  it("rejects send when no plugin is connected", async () => {
    await expect(bridge.send("get_document")).rejects.toThrow("Plugin not connected");
  });

  it("connects and sends/receives messages", async () => {
    const client = new WebSocket(`ws://127.0.0.1:${PORT}`);
    await new Promise<void>((resolve) => client.on("open", resolve));

    expect(bridge.connected).toBe(true);

    client.on("message", (raw) => {
      const req = JSON.parse(raw.toString());
      client.send(JSON.stringify({ requestId: req.requestId, data: { pages: [] } }));
    });

    const resp = await bridge.send("get_pages");
    expect(resp.data).toEqual({ pages: [] });

    client.close();
    await new Promise((r) => setTimeout(r, 50));
  });

  it("replaces old connection when new plugin connects", async () => {
    const client1 = new WebSocket(`ws://127.0.0.1:${PORT}`);
    await new Promise<void>((resolve) => client1.on("open", resolve));
    expect(bridge.connected).toBe(true);

    const client2 = new WebSocket(`ws://127.0.0.1:${PORT}`);
    await new Promise<void>((resolve) => client2.on("open", resolve));

    client2.on("message", (raw) => {
      const req = JSON.parse(raw.toString());
      client2.send(JSON.stringify({ requestId: req.requestId, data: "from-client2" }));
    });

    const resp = await bridge.send("get_metadata");
    expect(resp.data).toBe("from-client2");

    client1.close();
    client2.close();
    await new Promise((r) => setTimeout(r, 50));
  });

  it("handles error responses from plugin", async () => {
    const client = new WebSocket(`ws://127.0.0.1:${PORT}`);
    await new Promise<void>((resolve) => client.on("open", resolve));

    client.on("message", (raw) => {
      const req = JSON.parse(raw.toString());
      client.send(JSON.stringify({ requestId: req.requestId, error: "node not found" }));
    });

    const resp = await bridge.send("get_node", ["999:999"]);
    expect(resp.error).toBe("node not found");

    client.close();
    await new Promise((r) => setTimeout(r, 50));
  });

  it("times out if plugin never responds", async () => {
    const client = new WebSocket(`ws://127.0.0.1:${PORT}`);
    await new Promise<void>((resolve) => client.on("open", resolve));

    vi.useFakeTimers();

    const promise = bridge.send("get_node", ["1:2"]);
    const caught = promise.catch((e) => e);

    await vi.advanceTimersByTimeAsync(30_001);

    const err = await caught;
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain("timed out");

    vi.useRealTimers();
    client.close();
    await new Promise((r) => setTimeout(r, 50));
  });

  it("handles progress messages without resolving early", async () => {
    const client = new WebSocket(`ws://127.0.0.1:${PORT}`);
    await new Promise<void>((resolve) => client.on("open", resolve));

    client.on("message", (raw) => {
      const req = JSON.parse(raw.toString());
      client.send(JSON.stringify({ requestId: req.requestId, progress: 50, message: "halfway" }));
      setTimeout(() => {
        client.send(JSON.stringify({ requestId: req.requestId, data: "done" }));
      }, 50);
    });

    const resp = await bridge.send("get_document");
    expect(resp.data).toBe("done");

    client.close();
    await new Promise((r) => setTimeout(r, 50));
  });
});
