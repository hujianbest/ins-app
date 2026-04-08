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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.18),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0f172a_56%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">收件箱</p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">{roleCopy?.title}消息</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">
              直接在工作台流程内查看来自主页、作品和约拍诉求的咨询，不必离开当前身份上下文。
            </p>
          </div>
          <Link href="/studio" className="text-sm uppercase tracking-[0.28em] text-cyan-200 transition hover:text-white">
            返回工作台
          </Link>
        </div>

        <div className="grid gap-5">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <article
                key={thread.id}
                className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{thread.sourceLabel}</p>
                <h2 className="mt-3 text-2xl font-medium text-white">{thread.participantName}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{thread.preview}</p>
                <Link href={thread.sourceHref} className="mt-4 inline-flex text-base text-cyan-200 transition hover:text-white">
                  查看来源
                </Link>
              </article>
            ))
          ) : (
            <section className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
              <p className="text-lg text-slate-300">暂时还没有对话。</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
