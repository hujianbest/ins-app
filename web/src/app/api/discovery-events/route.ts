import { getSessionContext } from "@/features/auth/session";
import { recordDiscoveryEvent } from "@/features/discovery/events";
import { wrapRouteHandler } from "@/features/observability/server-boundary";

type DiscoveryEventRequestBody = {
  eventType: "work_view" | "profile_view";
  targetType: "work" | "profile";
  targetId: string;
  targetProfileId?: string;
  surface: string;
  query?: string;
};

async function discoveryEventsHandler(request: Request): Promise<Response> {
  const payload = (await request.json()) as DiscoveryEventRequestBody;
  const session = await getSessionContext();

  await recordDiscoveryEvent({
    eventType: payload.eventType,
    actorAccountId: session.accountId,
    targetType: payload.targetType,
    targetId: payload.targetId,
    targetProfileId: payload.targetProfileId,
    surface: payload.surface,
    query: payload.query ?? "",
    success: true,
  });

  return Response.json({ ok: true });
}

export const POST = wrapRouteHandler("discovery-events", discoveryEventsHandler);
