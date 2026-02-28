import { describe, it, expect } from "vitest";
import {
  isBridgeRequest,
  isBridgeResponse,
  isBridgePush,
  BRIDGE_SOURCE,
} from "@/bridge/protocol";

function fakeEvent(data: unknown): MessageEvent {
  return { data } as MessageEvent;
}

describe("isBridgeRequest", () => {
  it("returns true for a valid request", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "main-to-isolated",
      id: "req-1",
      action: "storage:get",
    });
    expect(isBridgeRequest(event)).toBe(true);
  });

  it("returns false for wrong source", () => {
    const event = fakeEvent({
      source: "other",
      direction: "main-to-isolated",
      id: "req-1",
    });
    expect(isBridgeRequest(event)).toBe(false);
  });

  it("returns false for wrong direction", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "isolated-to-main",
      id: "req-1",
    });
    expect(isBridgeRequest(event)).toBe(false);
  });

  it("returns false when id is missing", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "main-to-isolated",
    });
    expect(isBridgeRequest(event)).toBe(false);
  });

  it("returns false when id is null", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "main-to-isolated",
      id: null,
    });
    expect(isBridgeRequest(event)).toBe(false);
  });

  it("returns false for null data", () => {
    const event = fakeEvent(null);
    expect(isBridgeRequest(event)).toBe(false);
  });

  it("returns false for undefined data", () => {
    const event = fakeEvent(undefined);
    expect(isBridgeRequest(event)).toBe(false);
  });
});

describe("isBridgeResponse", () => {
  it("returns true for a valid response", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "isolated-to-main",
      id: "resp-1",
      ok: true,
    });
    expect(isBridgeResponse(event)).toBe(true);
  });

  it("returns false for wrong source", () => {
    const event = fakeEvent({
      source: "wrong",
      direction: "isolated-to-main",
      id: "resp-1",
    });
    expect(isBridgeResponse(event)).toBe(false);
  });

  it("returns false for wrong direction", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "main-to-isolated",
      id: "resp-1",
    });
    expect(isBridgeResponse(event)).toBe(false);
  });

  it("returns false when id is missing", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "isolated-to-main",
    });
    expect(isBridgeResponse(event)).toBe(false);
  });

  it("returns false when id is null (that is a push, not a response)", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "isolated-to-main",
      id: null,
    });
    expect(isBridgeResponse(event)).toBe(false);
  });
});

describe("isBridgePush", () => {
  it("returns true for a valid push (id: null)", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "isolated-to-main",
      id: null,
      action: "theme:apply",
    });
    expect(isBridgePush(event)).toBe(true);
  });

  it("returns false when id is a string (that is a response)", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "isolated-to-main",
      id: "some-id",
    });
    expect(isBridgePush(event)).toBe(false);
  });

  it("returns false for wrong source", () => {
    const event = fakeEvent({
      source: "other",
      direction: "isolated-to-main",
      id: null,
    });
    expect(isBridgePush(event)).toBe(false);
  });

  it("returns false for wrong direction", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "main-to-isolated",
      id: null,
    });
    expect(isBridgePush(event)).toBe(false);
  });

  it("returns false when id is undefined", () => {
    const event = fakeEvent({
      source: BRIDGE_SOURCE,
      direction: "isolated-to-main",
    });
    expect(isBridgePush(event)).toBe(false);
  });
});
