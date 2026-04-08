import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import { getOpportunityPostsByRole } from "@/features/showcase/sample-data";

export default async function StudioOpportunitiesPage() {
  const sessionRole = await getSessionRole();

  if (!sessionRole) {
    redirect("/login");
    return null;
  }

  const managedPosts = getOpportunityPostsByRole(sessionRole);
  const draft = managedPosts[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.18),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0f172a_56%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Studio opportunities</p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Manage opportunities</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">
              Draft, refresh, and retire booking requests so visitors always see the latest city and schedule information from your studio.
            </p>
          </div>
          <Link href="/studio" className="text-sm uppercase tracking-[0.28em] text-cyan-200 transition hover:text-white">
            Back to studio
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]">
          <form className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/50">Title</span>
              <input
                defaultValue={draft?.title}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.28em] text-white/50">City</span>
                <input
                  defaultValue={draft?.city}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.28em] text-white/50">Time</span>
                <input
                  defaultValue={draft?.schedule}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/50">Summary</span>
              <textarea
                defaultValue={draft?.summary}
                rows={5}
                className="w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-base leading-7 text-white outline-none"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
              >
                Publish request
              </button>
              <button
                type="button"
                className="inline-flex rounded-full border border-white/15 px-5 py-3 text-sm text-white transition hover:border-cyan-200/50 hover:text-cyan-200"
              >
                Save draft
              </button>
              <button
                type="button"
                className="inline-flex rounded-full border border-white/15 px-5 py-3 text-sm text-white transition hover:border-cyan-200/50 hover:text-cyan-200"
              >
                Unpublish
              </button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.28em] text-white/50">Current requests</p>
            <div className="mt-5 grid gap-4">
              {managedPosts.map((post) => (
                <article key={post.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{post.city}</p>
                  <h2 className="mt-3 text-2xl font-medium text-white">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{post.schedule}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
