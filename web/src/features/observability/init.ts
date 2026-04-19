import {
  type InMemoryLogger,
  type Logger,
  type LoggerOptions,
  createInMemoryLogger,
  createLogger,
} from "./logger";

export type ObservabilityRuntime = {
  logger: Logger;
};

let runtime: ObservabilityRuntime | undefined;

export type ObservabilityRuntimeOptions = {
  logger?: Logger | LoggerOptions;
};

function instantiate(options: ObservabilityRuntimeOptions = {}): ObservabilityRuntime {
  const loggerInput = options.logger;
  let logger: Logger;

  if (loggerInput && typeof (loggerInput as Logger).info === "function") {
    logger = loggerInput as Logger;
  } else {
    logger = createLogger((loggerInput as LoggerOptions | undefined) ?? {});
  }

  return { logger };
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

export type InstallInMemoryLoggerOptions = LoggerOptions;

export function installInMemoryLogger(options: InstallInMemoryLoggerOptions = {}): InMemoryLogger {
  const logger = createInMemoryLogger(options);
  runtime = { logger };
  return logger;
}
