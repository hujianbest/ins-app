import { getSessionContext } from "@/features/auth/session";
import type { DiscoveryEventType } from "@/features/community/types";
import { recordDiscoveryEvent } from "@/features/discovery/events";
import { wrapRouteHandler } from "@/features/observability/server-boundary";

type DiscoveryEventRequestBody = {
  // Phase 2 — Discovery Intelligence V1 (FR-005): widened to the full
  // DiscoveryEventType union so the recommendations module can post
  // `related_card_view` events through the same endpoint without
  // schema changes.
  eventType: DiscoveryEventType;
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
