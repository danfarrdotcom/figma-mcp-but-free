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
