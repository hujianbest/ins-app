import type { Writable } from "node:stream";

import type { AppError } from "./errors";

export interface ErrorReporter {
  report(error: AppError): void;
}

export type ErrorReporterProvider = "noop" | "console" | "sentry";

export type ErrorReporterConfig = {
  provider?: string;
  dsn?: string;
};

export function createNoopReporter(): ErrorReporter {
  return {
    report() {
      /* intentional no-op */
    },
  };
}

export type ConsoleReporterOptions = {
  stream?: Writable;
};

export function createConsoleReporter(
  options: ConsoleReporterOptions = {},
): ErrorReporter {
  const stream = options.stream ?? process.stderr;
  return {
    report(error) {
      const payload = {
        code: error.code,
        message: error.message,
        traceId: error.traceId,
        stack: error.stack,
      };
      stream.write(`${JSON.stringify(payload)}\n`);
    },
  };
}

export type FallbackReason =
  | "missing-dsn"
  | "sdk-not-bundled"
  | "unknown-provider";

export type ResolvedReporter = {
  reporter: ErrorReporter;
  fallback?: {
    requested: string;
    reason: FallbackReason;
  };
};

export function resolveErrorReporter(
  config: ErrorReporterConfig = {},
): ResolvedReporter {
  const provider = (config.provider ?? "noop").trim().toLowerCase();

  if (provider === "noop" || provider === "") {
    return { reporter: createNoopReporter() };
  }

  if (provider === "console") {
    return { reporter: createConsoleReporter() };
  }

  if (provider === "sentry") {
    if (!config.dsn || config.dsn.trim() === "") {
      return {
        reporter: createNoopReporter(),
        fallback: { requested: "sentry", reason: "missing-dsn" },
      };
    }
    return {
      reporter: createNoopReporter(),
      fallback: { requested: "sentry", reason: "sdk-not-bundled" },
    };
  }

  return {
    reporter: createNoopReporter(),
    fallback: { requested: provider, reason: "unknown-provider" },
  };
}
