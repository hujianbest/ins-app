import { getObservability } from "@/features/observability/init";
import { wrapRouteHandler } from "@/features/observability/server-boundary";

export const dynamic = "force-dynamic";

function readMetricsConfig(): { enabled: boolean; token?: string } {
  const enabledRaw = process.env.OBSERVABILITY_METRICS_ENABLED?.trim().toLowerCase();
  const enabled = enabledRaw === "true";
  const token = process.env.OBSERVABILITY_METRICS_TOKEN?.trim();
  return { enabled, token: token && token.length > 0 ? token : undefined };
}

function notFound(): Response {
  return Response.json({ error: "not_found" }, { status: 404 });
}

function unauthorized(): Response {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

async function metricsHandler(request: Request): Promise<Response> {
  const { enabled, token } = readMetricsConfig();

  if (!enabled) {
    return notFound();
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const expected = token ? `Bearer ${token}` : undefined;

  if (!expected || authHeader !== expected) {
    return unauthorized();
  }

  const { metrics } = getObservability();
  return Response.json(metrics.snapshot(), { status: 200 });
}

export const GET = wrapRouteHandler("metrics", metricsHandler);
