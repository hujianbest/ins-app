import { getSessionContext } from "@/features/auth/session";
import { getPublicProfilePageModel } from "@/features/community/public-read-model";
import {
  buildDiscoveryProfileTargetId,
  recordDiscoveryEvent,
} from "@/features/discovery/events";

type OutboundRouteContext = {
  params: Promise<{
    role: string;
    slug: string;
  }>;
};

function isSupportedRole(value: string): value is "photographer" | "model" {
  return value === "photographer" || value === "model";
}

export async function GET(_request: Request, context: OutboundRouteContext) {
  const { role, slug } = await context.params;

  if (!isSupportedRole(role)) {
    return new Response("Not found", { status: 404 });
  }

  const profile = await getPublicProfilePageModel(role, slug);
  const session = await getSessionContext();
  const targetProfileId = buildDiscoveryProfileTargetId(role, slug);

  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  if (!profile.externalHandoffUrl) {
    await recordDiscoveryEvent({
      eventType: "external_handoff_click",
      actorAccountId: session.accountId,
      targetType: "profile",
      targetId: targetProfileId,
      targetProfileId,
      surface: "outbound_route",
      query: "",
      success: false,
      failureReason: "missing_external_handoff_url",
    });
    return new Response("Not found", { status: 404 });
  }

  await recordDiscoveryEvent({
    eventType: "external_handoff_click",
    actorAccountId: session.accountId,
    targetType: "profile",
    targetId: targetProfileId,
    targetProfileId,
    surface: "outbound_route",
    query: "",
    success: true,
  });

  return Response.redirect(profile.externalHandoffUrl, 307);
}
