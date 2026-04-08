import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import { getProfileByRole } from "@/features/showcase/sample-data";

export default async function StudioProfilePage() {
  const sessionRole = await getSessionRole();

  if (!sessionRole) {
    redirect("/login");
    return null;
  }

  const profile = getProfileByRole(sessionRole);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.18),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0f172a_56%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Studio profile</p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Edit profile</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">
              Refine your public identity, keep the city and positioning up to date, and prepare the profile surface that visitors will see first.
            </p>
          </div>
          <Link href="/studio" className="text-sm uppercase tracking-[0.28em] text-cyan-200 transition hover:text-white">
            Back to studio
          </Link>
        </div>

        <form className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-white/50">Display name</span>
            <input
              defaultValue={profile?.name}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
            />
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/50">City</span>
              <input
                defaultValue={profile?.city}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/50">Tagline</span>
              <input
                defaultValue={profile?.tagline}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-white/50">Bio</span>
            <textarea
              defaultValue={profile?.bio}
              rows={6}
              className="w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-base leading-7 text-white outline-none"
            />
          </label>

          <button
            type="button"
            className="inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
          >
            Save profile changes
          </button>
        </form>
      </section>
    </main>
  );
}
