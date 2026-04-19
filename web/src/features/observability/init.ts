import {
  type ErrorReporter,
  createNoopReporter,
} from "./error-reporter";
import {
  type InMemoryLogger,
  type Logger,
  type LoggerOptions,
  createInMemoryLogger,
  createLogger,
} from "./logger";

export type ObservabilityRuntime = {
  logger: Logger;
  errorReporter: ErrorReporter;
};

let runtime: ObservabilityRuntime | undefined;

export type ObservabilityRuntimeOptions = {
  logger?: Logger | LoggerOptions;
  errorReporter?: ErrorReporter;
};

function instantiate(options: ObservabilityRuntimeOptions = {}): ObservabilityRuntime {
  const loggerInput = options.logger;
  let logger: Logger;

  if (loggerInput && typeof (loggerInput as Logger).info === "function") {
    logger = loggerInput as Logger;
  } else {
    logger = createLogger((loggerInput as LoggerOptions | undefined) ?? {});
  }

  const errorReporter = options.errorReporter ?? createNoopReporter();

  return { logger, errorReporter };
}

export function getObservability(): ObservabilityRuntime {
  if (!runtime) {
    runtime = instantiate();
  }
  return runtime;
}

export function setObservabilityForTesting(options: ObservabilityRuntimeOptions): ObservabilityRuntime {
  runtime = instantiate(options);
  return runtime;
}

export function setObservabilityRuntime(value: ObservabilityRuntime): void {
  runtime = value;
}

export function resetObservabilityForTesting(): void {
  runtime = undefined;
}

export function installInMemoryLogger(options: LoggerOptions = {}): InMemoryLogger {
  const logger = createInMemoryLogger(options);
  if (runtime) {
    runtime = { ...runtime, logger };
  } else {
    runtime = { logger, errorReporter: createNoopReporter() };
  }
  return logger;
}

export type InMemoryReporter = ErrorReporter & {
  readonly reports: ReadonlyArray<unknown>;
  reset(): void;
};

export type InMemoryReporterOptions = {
  onReport?: (error: unknown) => void;
};

export function createInMemoryReporter(
  options: InMemoryReporterOptions = {},
): InMemoryReporter {
  const reports: unknown[] = [];
  return {
    report(error) {
      reports.push(error);
      options.onReport?.(error);
    },
    reports,
    reset() {
      reports.length = 0;
    },
  };
}

export function installInMemoryReporter(
  options: InMemoryReporterOptions = {},
): InMemoryReporter {
  const reporter = createInMemoryReporter(options);
  if (runtime) {
    runtime = { ...runtime, errorReporter: reporter };
  } else {
    runtime = { logger: createLogger(), errorReporter: reporter };
  }
  return reporter;
}
