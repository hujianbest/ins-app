import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import { getInboxThreadsForRole } from "@/features/contact/state";
import { getAuthRoleCopy } from "@/features/auth/auth-copy";

export default async function InboxPage() {
  const sessionRole = await getSessionRole();

  if (!sessionRole) {
    redirect("/login");
    return null;
  }

  const threads = await getInboxThreadsForRole(sessionRole);
  const roleCopy = getAuthRoleCopy(sessionRole);

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <p className="museum-label">收件箱</p>
            <h1 className="font-display text-5xl leading-none tracking-[-0.04em] text-[color:var(--accent-strong)] sm:text-6xl">
              {roleCopy?.title}消息
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted-strong)]">
              直接在工作台流程内查看来自主页、作品和约拍诉求的咨询，不必离开当前身份上下文。
            </p>
          </div>
          <Link href="/studio" className="museum-button-quiet text-sm uppercase tracking-[0.28em]">
            返回工作台
          </Link>
        </div>

        <div className="grid gap-5">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <article
                key={thread.id}
                className="museum-panel museum-panel--soft p-6"
              >
                <p className="museum-label">{thread.sourceLabel}</p>
                <h2 className="font-display mt-3 text-3xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
                  {thread.participantName}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">{thread.preview}</p>
                <Link href={thread.sourceHref} className="museum-button-quiet mt-4 text-base">
                  查看来源
                </Link>
              </article>
            ))
          ) : (
            <section className="museum-empty p-6">
              <p className="text-lg text-[color:var(--muted-strong)]">暂时还没有对话。</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
