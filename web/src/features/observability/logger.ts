import { getCurrentTraceId } from "./trace";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export type AllowedContextKey =
  | "module"
  | "actionName"
  | "route"
  | "method"
  | "status"
  | "durationMs"
  | "code"
  | "errorClass"
  | "userIdHash"
  | "role"
  | "workId"
  | "creatorId"
  | "postId"
  | "threadId"
  | "slowQueryMs"
  | "queryName"
  | "backupFile"
  | "scriptName";

const ALLOWED_KEYS: ReadonlySet<string> = new Set<AllowedContextKey>([
  "module",
  "actionName",
  "route",
  "method",
  "status",
  "durationMs",
  "code",
  "errorClass",
  "userIdHash",
  "role",
  "workId",
  "creatorId",
  "postId",
  "threadId",
  "slowQueryMs",
  "queryName",
  "backupFile",
  "scriptName",
]);

export type ErrorContext = {
  name?: string;
  message?: string;
  stack?: string;
};

export type LogContext = Partial<Record<AllowedContextKey, unknown>> & {
  error?: ErrorContext | unknown;
};

export type LogRecord = {
  timestamp: string;
  level: LogLevel;
  traceId: string;
  event: string;
  truncated?: true;
  error?: ErrorContext;
} & Partial<Record<AllowedContextKey, unknown>>;

export interface Logger {
  debug(event: string, ctx?: LogContext): void;
  info(event: string, ctx?: LogContext): void;
  warn(event: string, ctx?: LogContext): void;
  error(event: string, ctx: LogContext & { error: ErrorContext | unknown }): void;
}

export type LoggerMode = "json" | "pretty";

export type LoggerOptions = {
  level?: LogLevel;
  mode?: LoggerMode;
  emit?: (line: string, record: LogRecord) => void;
};

const MAX_LOG_BYTES = 8 * 1024;

function pickAllowed(ctx: LogContext | undefined): Partial<Record<AllowedContextKey, unknown>> {
  if (!ctx) {
    return {};
  }

  const picked: Partial<Record<AllowedContextKey, unknown>> = {};

  for (const key of Object.keys(ctx)) {
    if (key === "error") {
      continue;
    }
    if (ALLOWED_KEYS.has(key)) {
      picked[key as AllowedContextKey] = ctx[key as AllowedContextKey];
    }
  }

  return picked;
}

function normalizeError(value: unknown): ErrorContext | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (typeof value === "object") {
    const candidate = value as Partial<ErrorContext>;
    return {
      name: typeof candidate.name === "string" ? candidate.name : undefined,
      message: typeof candidate.message === "string" ? candidate.message : undefined,
      stack: typeof candidate.stack === "string" ? candidate.stack : undefined,
    };
  }

  return { message: String(value) };
}

function maybeTruncate(record: LogRecord): LogRecord {
  let serialized = JSON.stringify(record);
  if (serialized.length <= MAX_LOG_BYTES) {
    return record;
  }

  const truncated: LogRecord = { ...record, truncated: true };
  if (truncated.error?.stack) {
    truncated.error = { ...truncated.error, stack: undefined };
  }
  serialized = JSON.stringify(truncated);

  if (serialized.length > MAX_LOG_BYTES) {
    if (truncated.error?.message) {
      const overhead = serialized.length - MAX_LOG_BYTES;
      truncated.error = {
        ...truncated.error,
        message: truncated.error.message.slice(0, Math.max(32, truncated.error.message.length - overhead - 16)),
      };
      serialized = JSON.stringify(truncated);
    }
  }

  if (serialized.length > MAX_LOG_BYTES) {
    return {
      timestamp: record.timestamp,
      level: record.level,
      traceId: record.traceId,
      event: record.event,
      truncated: true,
    };
  }

  return truncated;
}

function buildRecord(level: LogLevel, event: string, ctx: LogContext | undefined): LogRecord {
  const traceId = getCurrentTraceId() ?? "unknown";
  const allowed = pickAllowed(ctx);
  const errorPart = normalizeError(ctx?.error);

  const base: LogRecord = {
    timestamp: new Date().toISOString(),
    level,
    traceId,
    event,
    ...allowed,
  };

  if (errorPart) {
    base.error = errorPart;
  }

  return maybeTruncate(base);
}

function defaultEmit(line: string): void {
  process.stdout.write(`${line}\n`);
}

function prettyFormat(record: LogRecord): string {
  return `[${record.timestamp}] ${record.level.toUpperCase()} ${record.event} traceId=${record.traceId}`;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const minWeight = LEVEL_WEIGHT[options.level ?? "info"];
  const mode: LoggerMode = options.mode ?? "json";
  const emit = options.emit ?? defaultEmit;

  function emitIfAllowed(level: LogLevel, event: string, ctx?: LogContext) {
    if (LEVEL_WEIGHT[level] < minWeight) {
      return;
    }

    const record = buildRecord(level, event, ctx);
    const line = mode === "json" ? JSON.stringify(record) : prettyFormat(record);
    emit(line, record);
  }

  return {
    debug: (event, ctx) => emitIfAllowed("debug", event, ctx),
    info: (event, ctx) => emitIfAllowed("info", event, ctx),
    warn: (event, ctx) => emitIfAllowed("warn", event, ctx),
    error: (event, ctx) => emitIfAllowed("error", event, ctx),
  };
}

export type InMemoryLogger = Logger & {
  readonly records: LogRecord[];
  reset(): void;
};

export function createInMemoryLogger(options: LoggerOptions = {}): InMemoryLogger {
  const records: LogRecord[] = [];
  const logger = createLogger({
    ...options,
    emit: (_line, record) => records.push(record),
  });

  return {
    ...logger,
    records,
    reset: () => {
      records.length = 0;
    },
  };
}
