import type {
  CommunityRepositoryBundle,
  CommunityWorkRecord,
  DiscoveryEventRecord,
  WorkCommentRecord,
} from "@/features/community/types";
import type { MetricsRegistry } from "@/features/observability/metrics";

import { incrementSystemNotificationsListed } from "./metrics";

/**
 * Phase 2 — Threaded Messaging V1 (FR-005 system notifications,
 * read-only V1; ADR-2).
 */
export type SystemNotificationKind = "follow" | "comment" | "external_handoff";

export type SystemNotificationProjection = {
  id: string;
  kind: SystemNotificationKind;
  fromAccountId: string;
  href: string;
  createdAt: string;
};

function fromDiscoveryEvent(
  event: DiscoveryEventRecord,
): SystemNotificationProjection | null {
  if (event.eventType === "follow") {
    return {
      id: `follow:${event.id}`,
      kind: "follow",
      fromAccountId: event.actorAccountId ?? "",
      href: actorProfileHref(event.actorAccountId),
      createdAt: event.createdAt,
    };
  }
  if (event.eventType === "external_handoff_click") {
    return {
      id: `external_handoff:${event.id}`,
      kind: "external_handoff",
      fromAccountId: event.actorAccountId ?? "",
      href: actorProfileHref(event.actorAccountId),
      createdAt: event.createdAt,
    };
  }
  return null;
}

function actorProfileHref(actorAccountId: string | null): string {
  // Phase 1 ID space: actor account id may be `account:hex:role` form.
  // We can't synthesize a public profile href without a profile lookup,
  // so V1 falls back to /discover when actor profile cannot be derived.
  // Future V2 may join auth_accounts → creator_profiles.
  if (!actorAccountId) return "/discover";
  return "/discover";
}

function fromComment(
  comment: WorkCommentRecord,
  workOwnerHref: string,
): SystemNotificationProjection {
  return {
    id: `comment:${comment.id}`,
    kind: "comment",
    fromAccountId: comment.authorAccountId,
    href: workOwnerHref,
    createdAt: comment.createdAt,
  };
}

/**
 * Phase 2 — Threaded Messaging V1 (FR-005, ADR-2).
 *
 * Aggregates the latest system notifications for the given account
 * by reading existing `discovery_events` and `work_comments` (no
 * persistence). Increments `messaging.system_notifications_listed`
 * counter once per call (every `/inbox` SSR render counts as one
 * listing). The accountId here is a creator profile id (Phase 1
 * ID space, design §1).
 */
export async function listSystemNotificationsForAccount(
  accountId: string,
  limit = 50,
  bundle?: CommunityRepositoryBundle,
  metrics?: MetricsRegistry,
): Promise<SystemNotificationProjection[]> {
  const resolvedBundle = bundle ?? (await loadDefaultBundle());

  const allEvents = await resolvedBundle.discovery.listAll();
  const followAndHandoff: SystemNotificationProjection[] = [];
  for (const event of allEvents) {
    if (event.targetProfileId !== accountId) continue;
    const projection = fromDiscoveryEvent(event);
    if (projection) followAndHandoff.push(projection);
  }

  const ownedWorks = await resolvedBundle.works.listByOwnerProfileId(accountId);
  const commentsByOwner: SystemNotificationProjection[] = [];
  for (const work of ownedWorks) {
    const workComments = await resolvedBundle.comments.listByWorkId(work.id);
    for (const comment of workComments) {
      if (comment.authorAccountId === accountId) continue;
      commentsByOwner.push(
        fromComment(comment, hrefForOwnedWork(work)),
      );
    }
  }

  const merged = [...followAndHandoff, ...commentsByOwner].sort((a, b) => {
    if (a.createdAt === b.createdAt) {
      return a.id < b.id ? 1 : -1;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  if (metrics) {
    incrementSystemNotificationsListed(metrics);
  }

  return merged.slice(0, Math.max(0, limit));
}

function hrefForOwnedWork(work: CommunityWorkRecord): string {
  return `/works/${work.id}`;
}

async function loadDefaultBundle(): Promise<CommunityRepositoryBundle> {
  const { getDefaultCommunityRepositoryBundle } = await import(
    "@/features/community/runtime"
  );
  return getDefaultCommunityRepositoryBundle();
}
