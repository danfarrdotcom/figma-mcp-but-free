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

  it("leaves compound colon IDs unchanged", () => {
    expect(normalizeNodeId("I2167:9091;186:1579")).toBe("I2167:9091;186:1579");
  });

  it("leaves non-matching strings unchanged", () => {
    expect(normalizeNodeId("hello-world")).toBe("hello-world");
    expect(normalizeNodeId("abc")).toBe("abc");
  });

  it("does not convert if colons already present", () => {
    expect(normalizeNodeId("40:29-123")).toBe("40:29-123");
  });
});

describe("validNodeId", () => {
  it("accepts simple IDs", () => {
    expect(validNodeId("4029:12345")).toBe(true);
    expect(validNodeId("0:1")).toBe(true);
  });

  it("accepts instance IDs with I prefix", () => {
    expect(validNodeId("I2167:9091;186:1579;186:1745")).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(validNodeId("hello")).toBe(false);
    expect(validNodeId("4029-12345")).toBe(false);
    expect(validNodeId("")).toBe(false);
    expect(validNodeId("4029:")).toBe(false);
  });
});
