import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthRoleCopy } from "@/features/auth/auth-copy";
import { getSessionRole } from "@/features/auth/session";

export default async function StudioPage() {
  const sessionRole = await getSessionRole();

  if (!sessionRole) {
    redirect("/login");
    return null;
  }

  const roleCopy = getAuthRoleCopy(sessionRole);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.18),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0f172a_56%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Authenticated studio</p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            {roleCopy?.studioTitle ?? "Creator Studio"}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            Your primary role is now active. Use this protected entry point to continue into profile editing, work management, and opportunity publishing in the next tasks.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/studio/profile"
            className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Profile</p>
            <p className="mt-3 text-2xl font-medium text-white">Edit public profile</p>
          </Link>
          <Link
            href="/studio/works"
            className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Works</p>
            <p className="mt-3 text-2xl font-medium text-white">Manage portfolio items</p>
          </Link>
          <Link
            href="/studio/opportunities"
            className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Opportunities</p>
            <p className="mt-3 text-2xl font-medium text-white">Publish booking requests</p>
          </Link>
          <Link
            href="/inbox"
            className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Inbox</p>
            <p className="mt-3 text-2xl font-medium text-white">Open inbox</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
