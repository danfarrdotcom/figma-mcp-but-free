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
