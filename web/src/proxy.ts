// Next.js 16 proxy entry — runs at the edge boundary before route handlers / server actions.
// Per Next 16 docs (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`),
// proxy must not rely on shared modules or globals: the trace id is propagated to downstream
// by rewriting the inbound `x-trace-id` request header. Boundary wrappers
// (`wrapRouteHandler` / `wrapServerAction`) own the AsyncLocalStorage context.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { randomUUID } from "node:crypto";

const TRACE_HEADER = "x-trace-id";
// Mirrors the contract in `features/observability/trace.ts`. Kept inline to honor Next 16
// proxy isolation: proxy may run on a different runtime than the boundary wrappers, so we
// avoid importing application-side modules.
const TRACE_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

function isValidTraceId(value: string): boolean {
  return TRACE_ID_PATTERN.test(value);
}

export function proxy(request: NextRequest): NextResponse {
  const incoming = request.headers.get(TRACE_HEADER);
  const trimmed = incoming?.trim();
  const traceId =
    trimmed && isValidTraceId(trimmed) ? trimmed : randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TRACE_HEADER, traceId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(TRACE_HEADER, traceId);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map)$).*)",
  ],
};
