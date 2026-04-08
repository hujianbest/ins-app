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
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Inbox</p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">{roleCopy?.title} messages</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">
              Review inquiries that started from profiles, works, and booking requests without leaving the studio flow.
            </p>
          </div>
          <Link href="/studio" className="text-sm uppercase tracking-[0.28em] text-cyan-200 transition hover:text-white">
            Back to studio
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
                  View source
                </Link>
              </article>
            ))
          ) : (
            <section className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
              <p className="text-lg text-slate-300">No conversations yet.</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
