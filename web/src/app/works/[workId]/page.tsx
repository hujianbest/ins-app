import Link from "next/link";
import { notFound } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import { startContactThreadAction } from "@/features/contact/actions";
import { toggleWorkLikeAction } from "@/features/engagement/actions";
import { isWorkLiked } from "@/features/engagement/state";
import { getWorkById, works } from "@/features/showcase/sample-data";

export function generateStaticParams() {
  return works.map((work) => ({ workId: work.id }));
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const work = getWorkById(workId);

  if (!work) {
    notFound();
  }

  const sessionRole = await getSessionRole();
  const liked = await isWorkLiked(work.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.14),_transparent_20%),linear-gradient(180deg,_#050816_0%,_#0f172a_56%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm uppercase tracking-[0.3em] text-white/60">
          <p>{work.ownerRole} work</p>
          <Link href={`/${work.ownerRole}s/${work.ownerSlug}`} className="transition hover:text-cyan-200">
            Back to profile
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">{work.category}</p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">{work.title}</h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">{work.description}</p>
            </div>

            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">Profile</p>
                <p className="mt-3 text-base text-white">{work.ownerName}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">Like</p>
                {sessionRole ? (
                  <form action={toggleWorkLikeAction.bind(null, work.id, `/works/${work.id}`)}>
                    <button
                      type="submit"
                      className="mt-3 inline-flex rounded-full border border-cyan-200/40 px-4 py-2 text-base text-cyan-200 transition hover:border-white/60 hover:text-white"
                    >
                      {liked ? "Liked" : "Like this work"}
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="mt-3 inline-flex text-base text-cyan-200 transition hover:text-white">
                    Log in to like this work
                  </Link>
                )}
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">Private contact</p>
                {sessionRole ? (
                  <form action={startContactThreadAction.bind(null, work.ownerRole, work.ownerSlug, "work", work.id)}>
                    <button
                      type="submit"
                      className="mt-3 inline-flex rounded-full border border-cyan-200/40 px-4 py-2 text-base text-cyan-200 transition hover:border-white/60 hover:text-white"
                    >
                      Send message about this work
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="mt-3 inline-flex text-base text-cyan-200 transition hover:text-white">
                    {work.contactLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <div className="flex aspect-[4/5] items-end rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(103,232,249,0.12),_rgba(15,23,42,0.92))] p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/80">Work detail composition</p>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-black/20 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Detail note</p>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-300">{work.detailNote}</p>
        </section>
      </section>
    </main>
  );
}
