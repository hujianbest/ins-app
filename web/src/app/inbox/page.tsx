import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSessionContext } from "@/features/auth/session";
import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import { getObservability } from "@/features/observability/init";
import { resolveCallerProfileId } from "@/features/messaging/identity";
import { listInboxThreadsForAccount } from "@/features/messaging/inbox-model";
import {
  type SystemNotificationKind,
  type SystemNotificationProjection,
  listSystemNotificationsForAccount,
} from "@/features/messaging/system-notifications";
import { buildContextSourceLink } from "@/features/messaging/context-link";
import { PageHero } from "@/features/shell/page-hero";
import { SectionHeading } from "@/features/shell/section-heading";

export const metadata: Metadata = {
  title: "收件箱 | Lens Archive",
  robots: { index: false, follow: false },
};

const INBOX_ERROR_COPY: Record<string, string> = {
  unauthenticated: "请先登录后再发送消息。",
  forbidden_thread: "你没有访问该消息的权限。",
  recipient_not_found: "找不到该用户。",
  invalid_self_thread: "不能与自己开启对话。",
  message_empty: "消息不能为空。",
  message_too_long: "消息过长，请控制在 4000 字以内。",
  storage_failed: "操作失败，请稍后重试。",
};

const SYSTEM_NOTIFICATION_LABEL: Record<SystemNotificationKind, string> = {
  follow: "新增关注",
  comment: "新增评论",
  external_handoff: "外链点击",
};

function ErrorAlert({ code }: { code: string | null }) {
  if (!code) return null;
  const message = INBOX_ERROR_COPY[code] ?? "操作失败，请稍后重试。";
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

function SystemNotificationItem({
  notification,
}: {
  notification: SystemNotificationProjection;
}) {
  const label = SYSTEM_NOTIFICATION_LABEL[notification.kind];
  const description =
    notification.kind === "follow"
      ? `${notification.fromAccountId} 关注了你`
      : notification.kind === "comment"
        ? `${notification.fromAccountId} 评论了你的作品`
        : `${notification.fromAccountId} 打开了你的外部主页`;
  return (
    <li className="museum-stat p-5">
      <p className="museum-label">
        <span>{label}</span>
        <span className="ml-2 text-[color:var(--muted-strong)]">
          ·{" "}
          <time dateTime={notification.createdAt}>
            {formatHumanTime(notification.createdAt)}
          </time>
        </span>
      </p>
      <p className="mt-3 text-base text-[color:var(--accent-strong)]">
        {description}
      </p>
      <Link
        href={notification.href}
        className="museum-button-quiet mt-4 inline-block text-sm"
      >
        查看
      </Link>
    </li>
  );
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const session = await getSessionContext();
  if (session.status !== "authenticated") {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const errorParam = params.error;
  const errorCode =
    typeof errorParam === "string"
      ? errorParam
      : Array.isArray(errorParam)
        ? errorParam[0] ?? null
        : null;

  const callerProfileId = resolveCallerProfileId(session);
  const bundle = getDefaultCommunityRepositoryBundle();
  const { metrics } = getObservability();

  const [threads, notifications] = await Promise.all([
    listInboxThreadsForAccount(callerProfileId, 100, bundle),
    listSystemNotificationsForAccount(callerProfileId, 50, bundle, metrics),
  ]);

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <p className="museum-label">收件箱</p>
        <PageHero
          eyebrow="收件箱"
          title="消息"
          description="一对一对话与系统通知；最近活动优先。"
          tone="utility"
        />
        <ErrorAlert code={errorCode} />

        <section className="museum-panel museum-panel--soft p-6 md:p-8">
          <SectionHeading eyebrow="对话" title="直接消息" />
          {threads.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-[color:var(--muted-strong)]">
              暂无对话，去
              <Link href="/discover" className="museum-button-quiet ml-1 inline-block">
                创作者主页
              </Link>
              发起联系。
            </p>
          ) : (
            <div className="mt-6 grid gap-5">
              {threads.map((projection) => {
                const contextLink = buildContextSourceLink(
                  projection.thread.contextRef,
                );
                const lastActivity =
                  projection.thread.lastMessageAt ??
                  projection.thread.createdAt;
                return (
                  <Link
                    key={projection.thread.id}
                    href={`/inbox/${projection.thread.id}`}
                    className="museum-card block p-5"
                  >
                    <p className="museum-label">
                      <span className="museum-tag">{contextLink.label}</span>
                    </p>
                    <h3 className="font-display mt-3 text-2xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
                      {projection.counterpartAccountId}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted-strong)]">
                      <time dateTime={lastActivity}>
                        {formatHumanTime(lastActivity)}
                      </time>
                      {projection.unreadCount > 0 ? (
                        <span className="museum-tag ml-3">
                          {projection.unreadCount}
                          <span className="sr-only">未读</span>
                        </span>
                      ) : null}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="museum-panel museum-panel--soft p-6 md:p-8">
          <SectionHeading eyebrow="系统通知" title="最近活动" />
          {notifications.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-[color:var(--muted-strong)]">
              暂无系统通知。
            </p>
          ) : (
            <ul className="mt-6 grid gap-4">
              {notifications.map((notification) => (
                <SystemNotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
