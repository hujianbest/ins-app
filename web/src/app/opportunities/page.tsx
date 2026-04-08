import Link from "next/link";

import { opportunityPosts } from "@/features/showcase/sample-data";

export default function OpportunitiesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(163,230,255,0.16),_transparent_26%),linear-gradient(180deg,_#050816_0%,_#0b1020_54%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Public booking board</p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
            Active Opportunities
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            Browse current city and schedule requests from photographers and models, then continue into the full post or creator profile.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          {opportunityPosts.map((post) => (
            <Link
              key={post.id}
              href={`/opportunities/${post.id}`}
              className="block rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">{post.ownerRole} opportunity</p>
              <h2 className="mt-4 text-3xl font-medium text-white">{post.title}</h2>
              <div className="mt-5 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">City</p>
                  <p className="mt-2 text-base text-white">{post.city}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">Time</p>
                  <p className="mt-2 text-base text-white">{post.schedule}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">Posted by</p>
                  <p className="mt-2 text-base text-white">{post.ownerName}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-300">{post.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
