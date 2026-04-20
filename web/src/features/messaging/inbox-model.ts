import type {
  CommunityRepositoryBundle,
  InboxThreadProjection,
} from "@/features/community/types";

/**
 * Phase 2 — Threaded Messaging V1 (FR-005).
 *
 * Single-source-of-truth read for the `/inbox` direct-messages
 * section. Delegates to the bundle and does not increment any
 * counter; counter for the page-level "list rendered" event is
 * `messaging.system_notifications_listed` and lives in
 * `system-notifications.ts` (single counter per inbox SSR call).
 */
export async function listInboxThreadsForAccount(
  accountId: string,
  limit = 100,
  bundle?: CommunityRepositoryBundle,
): Promise<InboxThreadProjection[]> {
  const resolvedBundle = bundle ?? (await loadDefaultBundle());
  return resolvedBundle.messaging.threads.listThreadsForAccount(
    accountId,
    limit,
  );
}

async function loadDefaultBundle(): Promise<CommunityRepositoryBundle> {
  const { getDefaultCommunityRepositoryBundle } = await import(
    "@/features/community/runtime"
  );
  return getDefaultCommunityRepositoryBundle();
}
