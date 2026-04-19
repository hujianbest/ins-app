import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

import { getObservability } from "./init";
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
