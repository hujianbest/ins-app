"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AppError } from "@/features/observability/errors";
import { wrapServerAction } from "@/features/observability/server-boundary";

import { resolveCallerProfileId } from "./identity";
import {
  incrementMessagesSent,
  incrementThreadsCreated,
  incrementThreadsRead,
} from "./metrics";
import {
  type RunMessagingActionOptions,
  runMessagingAction,
} from "./runtime";

type MessagingDeps = Omit<RunMessagingActionOptions<unknown>, "actionName" | "fn">;

const MAX_MESSAGE_BODY_LENGTH = 4000;

async function createOrFindDirectThreadImpl(
  recipientAccountId: string,
  contextRef: string | undefined,
  deps?: MessagingDeps,
): Promise<{ threadId: string }> {
  return runMessagingAction({
    actionName: "messaging/createOrFindDirectThread",
    ...(deps ?? {}),
    fn: async (ctx) => {
      const callerProfileId = resolveCallerProfileId(ctx.session);
      if (recipientAccountId === callerProfileId) {
        throw new AppError({
          code: "invalid_self_thread",
          message: "Cannot start a thread with yourself.",
          status: 400,
        });
      }
      // recipient existence: Phase 1 ID-space → recipient is a creator profile id.
      const recipient = await ctx.bundle.profiles.getById(recipientAccountId);
      if (!recipient) {
        throw new AppError({
          code: "recipient_not_found",
          message: "Recipient not found.",
          status: 404,
        });
      }
      const existing =
        await ctx.bundle.messaging.threads.findDirectThreadByUnorderedPair(
          callerProfileId,
          recipientAccountId,
          contextRef,
        );
      if (existing) {
        return { threadId: existing.id };
      }
      const created = await ctx.bundle.messaging.threads.createDirectThread({
        initiatorAccountId: callerProfileId,
        recipientAccountId,
        contextRef,
      });
      incrementThreadsCreated(ctx.metrics);
      return { threadId: created.id };
    },
  });
}

async function sendMessageImpl(
  threadId: string,
  body: string,
  deps?: MessagingDeps,
): Promise<void> {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    throw new AppError({
      code: "message_empty",
      message: "Message body cannot be empty.",
      status: 400,
    });
  }
  if (trimmed.length > MAX_MESSAGE_BODY_LENGTH) {
    throw new AppError({
      code: "message_too_long",
      message: "Message body exceeds 4000 characters.",
      status: 400,
    });
  }
  await runMessagingAction({
    actionName: "messaging/sendMessage",
    ...(deps ?? {}),
    fn: async (ctx) => {
      const callerProfileId = resolveCallerProfileId(ctx.session);
      const participants =
        await ctx.bundle.messaging.participants.listForThread(threadId);
      if (!participants.some((p) => p.accountId === callerProfileId)) {
        throw new AppError({
          code: "forbidden_thread",
          message: "You do not have access to this thread.",
          status: 403,
        });
      }
      const now = new Date().toISOString();
      await ctx.bundle.messaging.messages.appendMessage({
        threadId,
        authorAccountId: callerProfileId,
        body: trimmed,
      });
      await ctx.bundle.messaging.threads.updateLastMessageAt(threadId, now);
      incrementMessagesSent(ctx.metrics);
    },
  });
}

async function markThreadReadImpl(
  threadId: string,
  deps?: MessagingDeps,
): Promise<void> {
  await runMessagingAction({
    actionName: "messaging/markThreadRead",
    ...(deps ?? {}),
    fn: async (ctx) => {
      const callerProfileId = resolveCallerProfileId(ctx.session);
      const participants =
        await ctx.bundle.messaging.participants.listForThread(threadId);
      if (!participants.some((p) => p.accountId === callerProfileId)) {
        throw new AppError({
          code: "forbidden_thread",
          message: "You do not have access to this thread.",
          status: 403,
        });
      }
      const now = new Date().toISOString();
      await ctx.bundle.messaging.participants.markRead(
        threadId,
        callerProfileId,
        now,
      );
      incrementThreadsRead(ctx.metrics);
    },
  });
}

export const createOrFindDirectThread = wrapServerAction(
  "messaging/createOrFindDirectThread",
  createOrFindDirectThreadImpl as (
    recipientAccountId: string,
    contextRef: string | undefined,
    deps?: MessagingDeps,
  ) => Promise<{ threadId: string }>,
);

export const sendMessage = wrapServerAction(
  "messaging/sendMessage",
  sendMessageImpl as (
    threadId: string,
    body: string,
    deps?: MessagingDeps,
  ) => Promise<void>,
);

export const markThreadRead = wrapServerAction(
  "messaging/markThreadRead",
  markThreadReadImpl as (
    threadId: string,
    deps?: MessagingDeps,
  ) => Promise<void>,
);

// ---------------------------------------------------------------------------
// Form-action wrappers (HTML <form action={...}> entries)
// ---------------------------------------------------------------------------

export async function sendMessageForm(formData: FormData): Promise<void> {
  const threadId = String(formData.get("threadId") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  try {
    await sendMessage(threadId, body);
    revalidatePath(`/inbox/${threadId}`);
    redirect(`/inbox/${threadId}`);
  } catch (error) {
    const code = error instanceof AppError ? error.code : "storage_failed";
    if (code === "forbidden_thread") {
      // Privacy: bounce back to /inbox without revealing thread id existence.
      redirect(`/inbox?error=${encodeURIComponent(code)}`);
    }
    redirect(`/inbox/${threadId}?error=${encodeURIComponent(code)}`);
  }
}

export async function markThreadReadForm(formData: FormData): Promise<void> {
  const threadId = String(formData.get("threadId") ?? "").trim();
  try {
    await markThreadRead(threadId);
    revalidatePath(`/inbox/${threadId}`);
    redirect(`/inbox/${threadId}`);
  } catch (error) {
    const code = error instanceof AppError ? error.code : "storage_failed";
    if (code === "forbidden_thread") {
      redirect(`/inbox?error=${encodeURIComponent(code)}`);
    }
    redirect(`/inbox?error=${encodeURIComponent(code)}`);
  }
}
