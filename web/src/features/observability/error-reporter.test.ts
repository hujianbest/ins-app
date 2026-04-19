// @vitest-environment node
import { Writable } from "node:stream";

import { describe, expect, it } from "vitest";

import {
  createConsoleReporter,
  createNoopReporter,
  resolveErrorReporter,
} from "./error-reporter";
import { AppError } from "./errors";

function makeAppError(): AppError {
  const e = new AppError({
    code: "boom",
    message: "Boom message",
    status: 500,
  });
  e.traceId = "trace-test";
  return e;
}

class CapturingStream extends Writable {
  readonly chunks: string[] = [];
  override _write(
    chunk: Buffer | string,
    _enc: BufferEncoding,
    cb: (err?: Error | null) => void,
  ): void {
    this.chunks.push(typeof chunk === "string" ? chunk : chunk.toString());
    cb();
  }
}

describe("observability/error-reporter noop", () => {
  it("does not throw and does not call any external resource", () => {
    const reporter = createNoopReporter();
    expect(() => reporter.report(makeAppError())).not.toThrow();
  });
});

describe("observability/error-reporter console", () => {
  it("writes a single JSON line containing code/message/traceId/stack", () => {
    const stream = new CapturingStream();
    const reporter = createConsoleReporter({ stream });
    reporter.report(makeAppError());

    expect(stream.chunks).toHaveLength(1);
    const parsed = JSON.parse(stream.chunks[0].trim());
    expect(parsed.code).toBe("boom");
    expect(parsed.message).toBe("Boom message");
    expect(parsed.traceId).toBe("trace-test");
    expect(parsed.stack).toEqual(expect.any(String));
  });
});

describe("observability/error-reporter resolveErrorReporter", () => {
  it("returns noop for provider=noop or undefined", () => {
    expect(resolveErrorReporter({ provider: "noop" }).fallback).toBeUndefined();
    expect(resolveErrorReporter({}).fallback).toBeUndefined();
  });

  it("returns console for provider=console", () => {
    const result = resolveErrorReporter({ provider: "console" });
    expect(result.fallback).toBeUndefined();
    expect(typeof result.reporter.report).toBe("function");
  });

  it("falls back to noop with reason=missing-dsn when sentry without DSN", () => {
    const result = resolveErrorReporter({ provider: "sentry", dsn: undefined });
    expect(result.fallback).toEqual({ requested: "sentry", reason: "missing-dsn" });
  });

  it("falls back to noop with reason=missing-dsn for empty-string DSN", () => {
    const result = resolveErrorReporter({ provider: "sentry", dsn: "  " });
    expect(result.fallback).toEqual({ requested: "sentry", reason: "missing-dsn" });
  });

  it("falls back to noop with reason=sdk-not-bundled when sentry+DSN set (V1 placeholder)", () => {
    const result = resolveErrorReporter({
      provider: "sentry",
      dsn: "https://example/1",
    });
    expect(result.fallback).toEqual({
      requested: "sentry",
      reason: "sdk-not-bundled",
    });
  });

  it("falls back to noop with reason=unknown-provider for unknown values", () => {
    const result = resolveErrorReporter({
      provider: "datadog",
      dsn: "x",
    });
    expect(result.fallback).toEqual({
      requested: "datadog",
      reason: "unknown-provider",
    });
  });
});
