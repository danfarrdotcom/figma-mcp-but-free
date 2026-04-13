import { describe, it, expect } from "vitest";
import { normalizeNodeId, validNodeId } from "../src/utils.js";

describe("normalizeNodeId", () => {
  it("converts hyphen format to colon format", () => {
    expect(normalizeNodeId("4029-12345")).toBe("4029:12345");
  });

  it("handles compound instance IDs", () => {
    expect(normalizeNodeId("2167-9091")).toBe("2167:9091");
  });

  it("leaves already-valid colon IDs unchanged", () => {
    expect(normalizeNodeId("4029:12345")).toBe("4029:12345");
  });
});
