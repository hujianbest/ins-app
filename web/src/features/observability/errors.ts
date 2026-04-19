import { getObservability } from "./init";
import { getCurrentTraceId } from "./trace";

export type AppErrorOptions = {
  code?: string;
  message?: string;
  status?: number;
  cause?: unknown;
};

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  traceId?: string;

  constructor(opts: AppErrorOptions = {}) {
    super(opts.message ?? "Internal server error.");
    this.name = "AppError";
    this.code = opts.code ?? "internal_error";
    this.status = opts.status ?? 500;
    if (opts.cause !== undefined) {
      (this as unknown as { cause?: unknown }).cause = opts.cause;
    }
  }
}

export type NormalizeContext = {
  actionName?: string;
  route?: string;
  module?: string;
};

export function normalizeError(error: unknown, ctx: NormalizeContext = {}): AppError {
  const traceId = getCurrentTraceId();
  const errorClass = error instanceof Error ? error.constructor.name : "Unknown";

  let appError: AppError;
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError({ cause: error });
  } else {
    appError = new AppError({ cause: error });
  }

  if (traceId !== undefined) {
    appError.traceId = traceId;
  }

  const { logger, errorReporter } = getObservability();

  logger.warn("error.normalized", {
    module: ctx.module ?? "boundary",
    actionName: ctx.actionName,
    route: ctx.route,
    code: appError.code,
    errorClass,
    error: error instanceof Error ? error : undefined,
  });

  try {
    errorReporter.report(appError);
  } catch (reporterError) {
    logger.warn("error.reporter.failed", {
      module: "error-reporter",
      errorClass:
        reporterError instanceof Error
          ? reporterError.constructor.name
          : "Unknown",
      error: reporterError instanceof Error ? reporterError : undefined,
    });
  }

  return appError;
}

export type AppErrorHttpBody = {
  error: {
    code: string;
    message: string;
    traceId?: string;
  };
};

export function appErrorToHttpBody(error: AppError): AppErrorHttpBody {
  return {
    error: {
      code: error.code,
      message: error.message,
      traceId: error.traceId,
    },
  };
}
