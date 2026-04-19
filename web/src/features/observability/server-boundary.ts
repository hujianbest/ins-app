import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

import { normalizeError } from "./errors";
import { getObservability } from "./init";
import { recordBusinessAction } from "./metrics";
import { isValidTraceId, runWithTrace } from "./trace";

export const TRACE_HEADER = "x-trace-id";

export type TraceIdSource = "inherited" | "generated" | "regenerated";

export type ResolveTraceResult = {
  traceId: string;
  source: TraceIdSource;
};

export function resolveTraceIdFromRequest(request: Request): ResolveTraceResult {
  const incoming = request.headers.get(TRACE_HEADER);

  if (incoming === null) {
    return { traceId: randomUUID(), source: "generated" };
  }

  const trimmed = incoming.trim();
  if (!isValidTraceId(trimmed)) {
    return { traceId: randomUUID(), source: "regenerated" };
  }

  return { traceId: trimmed, source: "inherited" };
}

function applyTraceHeader(response: Response, traceId: string): Response {
  if (response.headers.has(TRACE_HEADER)) {
    return response;
  }

  try {
    response.headers.set(TRACE_HEADER, traceId);
    return response;
  } catch {
    const headers = new Headers(response.headers);
    headers.set(TRACE_HEADER, traceId);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

export type RouteHandlerContext = { params: Promise<Record<string, string | string[]>> };

export type RouteHandler = (
  request: Request,
  context?: RouteHandlerContext,
) => Promise<Response>;

export function wrapRouteHandler<H extends RouteHandler>(
  routeName: string,
  handler: H,
): H {
  const wrapped = (async (request: Request, context?: RouteHandlerContext) => {
    const { traceId } = resolveTraceIdFromRequest(request);
    const start = performance.now();
    const { logger } = getObservability();

    return runWithTrace(traceId, async () => {
      try {
        const response = await handler(request, context as never);
        const durationMs = Math.round(performance.now() - start);
        const finalResponse = applyTraceHeader(response, traceId);
        logger.info("http.request.completed", {
          module: "route",
          route: routeName,
          method: request.method,
          status: finalResponse.status,
          durationMs,
        });
        return finalResponse;
      } catch (error) {
        const durationMs = Math.round(performance.now() - start);
        // Next framework-control errors flow as the framework's success path.
        if (isNextControlFlowError(error)) {
          logger.info("http.request.completed", {
            module: "route",
            route: routeName,
            method: request.method,
            durationMs,
          });
          throw error;
        }
        const errorClass =
          error instanceof Error ? error.constructor.name : "Unknown";
        logger.warn("http.request.error", {
          module: "route",
          route: routeName,
          method: request.method,
          durationMs,
          errorClass,
          error,
        });
        throw error;
      }
    });
  }) as H;

  Object.defineProperty(wrapped, "name", {
    value: handler.name || routeName,
    configurable: true,
  });

  return wrapped;
}

// Sanitized action-name slug used in business metrics: lower-case, [a-z0-9_]+
function metricKey(actionName: string): string {
  return actionName
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

// Detects Next.js framework-control errors that MUST propagate untouched
// (redirect, notFound, unauthorized, forbidden, dynamicUsage, etc.). These
// flow via Error.digest starting with `NEXT_` and are caught by the framework
// boundary above, not by application code.
function isNextControlFlowError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_");
}

/**
 * Wraps a server action with observability. MUST be called inside the same
 * 'use server' module that exports the action so that Next.js server-action
 * IDs remain stable and `length` / `name` / `this` are preserved (see design
 * §11.2 invariant I-7 and ADR-5).
 */
export function wrapServerAction<F extends (...args: never[]) => Promise<unknown>>(
  actionName: string,
  action: F,
): F {
  const wrapped = async function (this: unknown, ...args: Parameters<F>) {
    const start = performance.now();
    const { logger, metrics } = getObservability();
    const metric = metricKey(actionName);

    try {
      const result = await action.apply(this as never, args);
      const durationMs = Math.round(performance.now() - start);
      logger.info("server-action.completed", {
        module: "server-action",
        actionName,
        durationMs,
      });
      recordBusinessAction(metrics, metric, "success");
      return result;
    } catch (error) {
      // Framework-control errors (redirect / notFound / etc.) are the
      // documented success path for many Next.js APIs. We treat them as
      // success for the metric, do not invoke the error reporter, and
      // re-throw untouched so the framework boundary handles them.
      if (isNextControlFlowError(error)) {
        const durationMs = Math.round(performance.now() - start);
        logger.info("server-action.completed", {
          module: "server-action",
          actionName,
          durationMs,
        });
        recordBusinessAction(metrics, metric, "success");
        throw error;
      }

      const durationMs = Math.round(performance.now() - start);
      const appError = normalizeError(error, { actionName });
      logger.warn("server-action.error", {
        module: "server-action",
        actionName,
        durationMs,
        code: appError.code,
        errorClass:
          error instanceof Error ? error.constructor.name : "Unknown",
      });
      recordBusinessAction(metrics, metric, "failure");
      throw appError;
    }
  };

  Object.defineProperty(wrapped, "name", {
    value: action.name || actionName,
    configurable: true,
  });
  Object.defineProperty(wrapped, "length", {
    value: action.length,
    configurable: true,
  });

  return wrapped as unknown as F;
}
