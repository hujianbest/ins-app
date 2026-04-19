import { describe, expect, it } from "vitest";

import { proxy } from "./proxy";

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/health", { headers });
}

describe("proxy.ts (Next 16)", () => {
  it("inherits a valid inbound x-trace-id and writes it to both inbound and response headers", () => {
    const inbound = "walking-skeleton-001";
    const request = makeRequest({ "x-trace-id": inbound });

    const response = proxy(request as unknown as never);

    expect(response.headers.get("x-trace-id")).toBe(inbound);
  });

  it("regenerates trace id when inbound header is missing", () => {
    const response = proxy(makeRequest() as unknown as never);
    const traceId = response.headers.get("x-trace-id");
    expect(traceId).toBeTruthy();
    expect(/^[A-Za-z0-9_-]{8,128}$/.test(traceId as string)).toBe(true);
  });

  it("regenerates trace id when inbound header is invalid", () => {
    const response = proxy(
      makeRequest({ "x-trace-id": "  " }) as unknown as never,
    );
    const traceId = response.headers.get("x-trace-id");
    expect(traceId).toBeTruthy();
    expect(traceId).not.toBe("  ");
    expect(/^[A-Za-z0-9_-]{8,128}$/.test(traceId as string)).toBe(true);
  });

  it("regenerates trace id when inbound header is too short", () => {
    const response = proxy(
      makeRequest({ "x-trace-id": "abc" }) as unknown as never,
    );
    const traceId = response.headers.get("x-trace-id");
    expect(traceId).not.toBe("abc");
    expect(/^[A-Za-z0-9_-]{8,128}$/.test(traceId as string)).toBe(true);
  });
});
