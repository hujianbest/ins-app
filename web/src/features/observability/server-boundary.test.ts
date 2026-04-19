import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppError } from "./errors";
import {
  installFreshMetricsRegistry,
  installInMemoryLogger,
  installInMemoryReporter,
  resetObservabilityForTesting,
} from "./init";
import type { InMemoryLogger } from "./logger";
import { wrapRouteHandler, wrapServerAction } from "./server-boundary";
import { getCurrentTraceId, isValidTraceId, runWithTrace } from "./trace";

describe("observability/server-boundary wrapRouteHandler", () => {
  let logger: InMemoryLogger;

  beforeEach(() => {
    logger = installInMemoryLogger({ level: "debug" });
  });

  afterEach(() => {
    resetObservabilityForTesting();
  });

  it("inherits a valid x-trace-id from inbound header and propagates to inner handler", async () => {
    const inbound = "walking-skeleton-001";
    const handler = wrapRouteHandler("health", async (_req: Request) => {
      void _req;
      const observed = getCurrentTraceId();
      return Response.json({ ok: true, observed });
    });

    const response = await handler(
      new Request("http://localhost/api/health", {
        headers: { "x-trace-id": inbound },
      }),
    );

    const body = await response.json();
    expect(response.headers.get("x-trace-id")).toBe(inbound);
    expect(body.observed).toBe(inbound);

    const completed = logger.records.find((r) => r.event === "http.request.completed");
    expect(completed).toBeDefined();
    expect(completed?.traceId).toBe(inbound);
    expect(completed?.module).toBe("route");
    expect(completed?.route).toBe("health");
    expect(completed?.status).toBe(200);
    expect(typeof completed?.durationMs).toBe("number");
  });

  it("regenerates trace id when inbound header is missing or invalid", async () => {
    const handler = wrapRouteHandler("health", async (_req: Request) => {
      void _req;
      return Response.json({ ok: true });
    });

    const responseMissing = await handler(new Request("http://localhost/api/health"));
    const generated = responseMissing.headers.get("x-trace-id");
    expect(generated).toBeTruthy();
    expect(isValidTraceId(generated as string)).toBe(true);

    logger.reset();

    const responseInvalid = await handler(
      new Request("http://localhost/api/health", {
        headers: { "x-trace-id": "  " },
      }),
    );
    const regenerated = responseInvalid.headers.get("x-trace-id");
    expect(regenerated).toBeTruthy();
    expect(isValidTraceId(regenerated as string)).toBe(true);
    expect(regenerated).not.toBe("  ");
  });

  it("on inner throw, rethrows and emits a warn-level error event with traceId", async () => {
    const inbound = "walking-skeleton-002";
    const handler = wrapRouteHandler("boom", async (_req: Request) => {
      void _req;
      throw new Error("boom-inside");
    });

    await expect(
      handler(
        new Request("http://localhost/api/boom", {
          headers: { "x-trace-id": inbound },
        }),
      ),
    ).rejects.toThrow("boom-inside");

    const errored = logger.records.find((r) => r.event === "http.request.error");
    expect(errored).toBeDefined();
    expect(errored?.level).toBe("warn");
    expect(errored?.traceId).toBe(inbound);
    expect(errored?.module).toBe("route");
    expect(errored?.route).toBe("boom");
    expect(errored?.errorClass).toBe("Error");
  });

  it("preserves response status code and body from inner handler", async () => {
    const handler = wrapRouteHandler("custom-status", async (_req: Request) => {
      void _req;
      return Response.json({ ok: false, reason: "x" }, { status: 503 });
    });

    const response = await handler(new Request("http://localhost/api/x"));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.reason).toBe("x");

    const completed = logger.records.find((r) => r.event === "http.request.completed");
    expect(completed?.status).toBe(503);
  });
});

describe("observability/server-boundary wrapServerAction", () => {
  beforeEach(() => {
    installInMemoryLogger({ level: "debug" });
    installInMemoryReporter();
    installFreshMetricsRegistry();
  });

  afterEach(() => {
    resetObservabilityForTesting();
  });

  it("returns underlying value unchanged on success and emits server-action.completed", async () => {
    const original = async (a: number, b: number) => a + b;
    const wrapped = wrapServerAction("math/add", original);

    const result = await wrapped(2, 3);
    expect(result).toBe(5);

    // I-7: name + length + async preserved
    expect(wrapped.length).toBe(original.length);
    expect(typeof wrapped).toBe("function");
  });

  it("propagates trace id from runWithTrace through to logger", async () => {
    const logger = installInMemoryLogger({ level: "debug" });
    installInMemoryReporter();
    installFreshMetricsRegistry();

    const wrapped = wrapServerAction("math/add", async (a: number, b: number) => a + b);

    await runWithTrace("trace-server-action", async () => {
      await wrapped(2, 3);
    });

    const completed = logger.records.find(
      (r) => r.event === "server-action.completed",
    );
    expect(completed?.traceId).toBe("trace-server-action");
    expect(completed?.actionName).toBe("math/add");
    expect(typeof completed?.durationMs).toBe("number");
  });

  it("on throw, normalizes via reporter+logger and rethrows", async () => {
    const logger = installInMemoryLogger({ level: "debug" });
    const reporter = installInMemoryReporter();
    installFreshMetricsRegistry();

    const wrapped = wrapServerAction(
      "math/blowup",
      async (): Promise<void> => {
        throw new Error("kaboom");
      },
    );

    await expect(wrapped()).rejects.toMatchObject({
      code: "internal_error",
      status: 500,
    });

    const errored = logger.records.find(
      (r) => r.event === "server-action.error",
    );
    expect(errored).toBeDefined();
    expect(errored?.actionName).toBe("math/blowup");
    expect(errored?.errorClass).toBe("Error");

    // normalizeError emits a warn 'error.normalized' too
    const normalized = logger.records.find(
      (r) => r.event === "error.normalized",
    );
    expect(normalized).toBeDefined();

    expect(reporter.reports).toHaveLength(1);
  });

  it("preserves AppError code/status when the action throws an AppError", async () => {
    installInMemoryLogger({ level: "debug" });
    installInMemoryReporter();
    installFreshMetricsRegistry();

    const wrapped = wrapServerAction(
      "auth/forbidden",
      async (): Promise<void> => {
        throw new AppError({ code: "forbidden", status: 403, message: "Nope" });
      },
    );

    await expect(wrapped()).rejects.toMatchObject({
      code: "forbidden",
      status: 403,
      message: "Nope",
    });
  });

  it("works without active trace context and falls back to traceId='unknown'", async () => {
    const logger = installInMemoryLogger({ level: "debug" });
    installInMemoryReporter();
    installFreshMetricsRegistry();

    const wrapped = wrapServerAction("math/identity", async (x: number) => x);
    await wrapped(7);

    const completed = logger.records.find(
      (r) => r.event === "server-action.completed",
    );
    expect(completed?.traceId).toBe("unknown");
  });
});
