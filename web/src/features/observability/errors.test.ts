// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  AppError,
  appErrorToHttpBody,
  normalizeError,
} from "./errors";
import {
  installInMemoryLogger,
  installInMemoryReporter,
  resetObservabilityForTesting,
} from "./init";
import { runWithTrace } from "./trace";

function setup() {
  const logger = installInMemoryLogger({ level: "debug" });
  const reporter = installInMemoryReporter();
  return { logger, reporter };
}

describe("observability/errors AppError", () => {
  it("constructs with default code/status/message", () => {
    const err = new AppError();
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("internal_error");
    expect(err.status).toBe(500);
    expect(err.message).toBe("Internal server error.");
    expect(err.name).toBe("AppError");
    expect(err.cause).toBeUndefined();
    expect(err.traceId).toBeUndefined();
  });

  it("constructs with explicit code/status/message and preserves cause", () => {
    const original = new RangeError("range");
    const err = new AppError({
      code: "forbidden",
      status: 403,
      message: "Not allowed",
      cause: original,
    });
    expect(err.code).toBe("forbidden");
    expect(err.status).toBe(403);
    expect(err.message).toBe("Not allowed");
    expect(err.cause).toBe(original);
  });
});

describe("observability/errors normalizeError", () => {
  it("wraps a native Error into AppError with traceId, logs, and reports", () => {
    const { logger, reporter } = setup();
    try {
      runWithTrace("trace-x", () => {
        const result = normalizeError(new TypeError("oops"), {
          actionName: "foo",
        });

        expect(result).toBeInstanceOf(AppError);
        expect(result.code).toBe("internal_error");
        expect(result.status).toBe(500);
        expect(result.traceId).toBe("trace-x");
        expect(result.cause).toBeInstanceOf(TypeError);

        const logged = logger.records.find(
          (r) => r.event === "error.normalized",
        );
        expect(logged).toBeDefined();
        expect(logged?.level).toBe("warn");
        expect(logged?.traceId).toBe("trace-x");
        expect(logged?.actionName).toBe("foo");
        expect(logged?.code).toBe("internal_error");
        expect(logged?.errorClass).toBe("TypeError");

        expect(reporter.reports).toHaveLength(1);
        expect(reporter.reports[0]).toBe(result);
      });
    } finally {
      resetObservabilityForTesting();
    }
  });

  it("preserves AppError code/status, attaches traceId, and still reports", () => {
    const { reporter } = setup();
    try {
      runWithTrace("trace-y", () => {
        const original = new AppError({ code: "forbidden", status: 403 });
        const result = normalizeError(original, { route: "metrics" });

        expect(result).toBe(original);
        expect(result.code).toBe("forbidden");
        expect(result.status).toBe(403);
        expect(result.traceId).toBe("trace-y");
        expect(reporter.reports).toHaveLength(1);
      });
    } finally {
      resetObservabilityForTesting();
    }
  });

  it("appErrorToHttpBody never leaks stack/cause/internal fields (I-2)", () => {
    setup();
    try {
      const original = new Error("internal-detail");
      const err = new AppError({
        code: "forbidden",
        status: 403,
        message: "Not allowed",
        cause: original,
      });
      Object.assign(err, { traceId: "trace-z" });
      const body = appErrorToHttpBody(err);

      expect(body).toEqual({
        error: { code: "forbidden", message: "Not allowed", traceId: "trace-z" },
      });
      const serialized = JSON.stringify(body);
      expect(serialized).not.toContain("internal-detail");
      expect(serialized).not.toContain("stack");
      expect(serialized).not.toContain("cause");
    } finally {
      resetObservabilityForTesting();
    }
  });

  it("does not bubble up reporter internal errors", () => {
    const logger = installInMemoryLogger({ level: "debug" });
    const reporter = installInMemoryReporter({
      onReport: () => {
        throw new Error("reporter-broken");
      },
    });
    try {
      const result = normalizeError(new Error("oops"), { actionName: "bar" });
      expect(result).toBeInstanceOf(AppError);
      expect(reporter.reports).toHaveLength(1);

      const failed = logger.records.find(
        (r) => r.event === "error.reporter.failed",
      );
      expect(failed).toBeDefined();
      expect(failed?.level).toBe("warn");
    } finally {
      resetObservabilityForTesting();
    }
  });
});
