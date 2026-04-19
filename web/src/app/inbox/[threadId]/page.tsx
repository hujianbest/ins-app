import Link from "next/link";
import type { Metadata } from "next";

import { getSessionContext } from "@/features/auth/session";
import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import { getObservability } from "@/features/observability/init";
import { buildContextSourceLink } from "@/features/messaging/context-link";
import { loadInboxThreadView } from "@/features/messaging/inbox-thread-view";
import { sendMessageForm } from "@/features/messaging/thread-actions";
import { PageHero } from "@/features/shell/page-hero";

import { InboxThreadPoll } from "./poll-client";

export const metadata: Metadata = {
  title: "对话 | Lens Archive",
  robots: { index: false, follow: false },
};

const THREAD_ERROR_COPY: Record<string, string> = {
  unauthenticated: "请先登录后再发送消息。",
  forbidden_thread: "你没有访问该消息的权限。",
  recipient_not_found: "找不到该用户。",
  invalid_self_thread: "不能与自己开启对话。",
  message_empty: "消息不能为空。",
  message_too_long: "消息过长，请控制在 4000 字以内。",
  storage_failed: "操作失败，请稍后重试。",
};

function ErrorAlert({ code }: { code: string | null }) {
  if (!code) return null;
  const message = THREAD_ERROR_COPY[code] ?? "操作失败，请稍后重试。";
  return (
    <div
      role="alert"
      aria-live="polite"
      className="museum-tag mt-4 block max-w-3xl text-sm leading-6 text-[color:var(--accent-strong)]"
    >
      {message}（错误码：{code}）
    </div>
  );
}

function formatHumanTime(iso: string): string {
  return iso.replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

export default async function ThreadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ threadId: string }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { threadId } = await params;
  const sParams = (await searchParams) ?? {};
  const errorParam = sParams.error;
  const errorCode =
    typeof errorParam === "string"
      ? errorParam
      : Array.isArray(errorParam)
        ? errorParam[0] ?? null
        : null;

  const session = await getSessionContext();
  const bundle = getDefaultCommunityRepositoryBundle();
  const { logger } = getObservability();

  const view = await loadInboxThreadView(threadId, session, {
    bundle,
    logger,
  });

  const contextLink = buildContextSourceLink(view.thread.contextRef);

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <p className="museum-label">
          <Link href="/inbox" className="museum-button-quiet inline-block">
            ← 返回收件箱
          </Link>
        </p>
        <PageHero
          eyebrow="对话"
          title={view.counterpartProfileId ?? "对话"}
          description={contextLink.label}
          tone="utility"
        />
        <ErrorAlert code={errorCode} />

        <section className="museum-panel museum-panel--soft p-6 md:p-8">
          {view.messages.length === 0 ? (
            <p className="text-sm leading-6 text-[color:var(--muted-strong)]">
              暂无消息，发出第一句话开启对话。
            </p>
          ) : (
            <ol className="flex flex-col gap-4">
              {view.messages.map((message) => {
                const isSelf = message.authorAccountId === view.callerProfileId;
                return (
                  <li
                    key={message.id}
                    className={`museum-stat max-w-[32rem] p-4 ${
                      isSelf ? "ml-auto text-right" : ""
                    }`}
                  >
                    <p className="museum-label">
                      {isSelf ? "我" : view.counterpartProfileId ?? "对方"}
                      <span className="ml-2 text-[color:var(--muted-strong)]">
                        ·{" "}
                        <time dateTime={message.createdAt}>
                          {formatHumanTime(message.createdAt)}
                        </time>
                      </span>
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-base text-[color:var(--accent-strong)]">
                      {message.body}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}

          <form action={sendMessageForm} className="mt-8 flex flex-col gap-3">
            <input type="hidden" name="threadId" value={view.thread.id} />
            <label className="sr-only" htmlFor="messaging-send-body">
              消息正文
            </label>
            <textarea
              id="messaging-send-body"
              name="body"
              maxLength={4000}
              required
              className="museum-field min-h-[6rem]"
              placeholder="写下你的消息…（最多 4000 字）"
            />
            <p className="sr-only">最多 4000 字</p>
            <button type="submit" className="museum-button-primary self-end">
              发送
            </button>
          </form>
        </section>

        <InboxThreadPoll intervalMs={30_000} />
      </section>
    </main>
  );
}
