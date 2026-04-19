import { notFound, redirect } from "next/navigation";

import type {
  AuthenticatedSessionContext,
  SessionContext,
} from "@/features/auth/types";
import type {
  CommunityRepositoryBundle,
  MessageRecord,
  MessageThreadParticipantRecord,
  MessageThreadRecord,
} from "@/features/community/types";
import type { Logger } from "@/features/observability/logger";

import { resolveCallerProfileId } from "./identity";

/**
 * Phase 2 — Threaded Messaging V1 (FR-006 SSR entry order, design §8.3 / §9.10).
 *
 * Single source of truth for `/inbox/[threadId]` SSR data loading.
 * Enforces the 4-step order in one place so future refactors (error
 * boundaries, Suspense) cannot reorder it:
 *   1. session: guest → redirect("/login")
 *   2. participant guard: not in participants → notFound()
 *   3. SSR-side markRead (writes log, does NOT increment counter)
 *   4. fetch thread + messages + counterpart
 */
export type InboxThreadView = {
  thread: MessageThreadRecord;
  messages: MessageRecord[];
  participants: MessageThreadParticipantRecord[];
  callerProfileId: string;
  counterpartProfileId: string | null;
};

export type LoadInboxThreadViewDeps = {
  bundle?: CommunityRepositoryBundle;
  logger?: Logger;
};

export async function loadInboxThreadView(
  threadId: string,
  session: SessionContext,
  deps: LoadInboxThreadViewDeps = {},
): Promise<InboxThreadView> {
  // Step 1: session
  if (session.status !== "authenticated") {
    redirect("/login");
  }
  const authenticated = session as AuthenticatedSessionContext;
  const callerProfileId = resolveCallerProfileId(authenticated);

  const bundle = deps.bundle ?? (await loadDefaultBundle());

  // Step 2: participant guard
  const participants =
    await bundle.messaging.participants.listForThread(threadId);
  if (!participants.some((p) => p.accountId === callerProfileId)) {
    notFound();
  }

  // Step 3: SSR-side markRead (no counter increment per design §9.10)
  const now = new Date().toISOString();
  await bundle.messaging.participants.markRead(threadId, callerProfileId, now);
  if (deps.logger) {
    deps.logger.info("messaging.action.completed", {
      module: "messaging",
      actionName: "messaging/markThreadRead.ssr",
      threadId,
    });
  }

  // Step 4: fetch
  const thread = await bundle.messaging.threads.getThreadById(threadId);
  if (!thread) {
    // Defensive: between step 2 and 4 the thread should not vanish in
    // normal flow; if it does, treat as not found rather than crash.
    notFound();
  }
  const messages = await bundle.messaging.messages.listByThreadId(
    threadId,
    200,
  );
  const counterpart = participants.find(
    (p) => p.accountId !== callerProfileId,
  );

  return {
    thread,
    messages,
    participants,
    callerProfileId,
    counterpartProfileId: counterpart?.accountId ?? null,
  };
}

async function loadDefaultBundle(): Promise<CommunityRepositoryBundle> {
  const { getDefaultCommunityRepositoryBundle } = await import(
    "@/features/community/runtime"
  );
  return getDefaultCommunityRepositoryBundle();
}
