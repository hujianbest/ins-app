import Link from "next/link";

import { startContactThreadAction } from "@/features/contact/actions";
import { toggleProfileFollowAction } from "@/features/social/actions";

import type { PublicProfile } from "./types";

type ProfileShowcasePageProps = {
  profile: PublicProfile;
  isSignedIn: boolean;
  isFollowing: boolean;
  returnPath: string;
};

function getRoleLabel(role: PublicProfile["role"]) {
  return role === "photographer" ? "摄影师" : "模特";
}

export function ProfileShowcasePage({ profile, isSignedIn, isFollowing, returnPath }: ProfileShowcasePageProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.16),_transparent_22%),linear-gradient(180deg,_#050816_0%,_#0f172a_54%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-12 px-6 py-10 sm:px-10 lg:px-14">
        <header className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">
                {getRoleLabel(profile.role)}主页
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
                {profile.name}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">{profile.tagline}</p>
            </div>

            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">城市</p>
                <p className="mt-3 text-base text-white">{profile.city}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">关注</p>
                {isSignedIn ? (
                  <form action={toggleProfileFollowAction.bind(null, profile.role, profile.slug, returnPath)}>
                    <button
                      type="submit"
                      className="mt-3 inline-flex rounded-full border border-cyan-200/40 px-4 py-2 text-base text-cyan-200 transition hover:border-white/60 hover:text-white"
                    >
                      {isFollowing ? "取消关注" : "关注这位创作者"}
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="mt-3 inline-flex text-base text-cyan-200 transition hover:text-white">
                    登录后关注这位创作者
                  </Link>
                )}
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">私信联系</p>
                {isSignedIn ? (
                  <form action={startContactThreadAction.bind(null, profile.role, profile.slug, "profile", profile.slug)}>
                    <button
                      type="submit"
                      className="mt-3 inline-flex rounded-full border border-cyan-200/40 px-4 py-2 text-base text-cyan-200 transition hover:border-white/60 hover:text-white"
                    >
                      发送关于这份主页的私信
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="mt-3 inline-flex text-base text-cyan-200 transition hover:text-white"
                  >
                    {profile.contactLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <div className="flex aspect-[4/5] items-end rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(103,232,249,0.16),_rgba(15,23,42,0.92))] p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/80">
                {profile.heroImageLabel}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">主页介绍</p>
            <p className="mt-4 text-base leading-8 text-slate-300">{profile.bio}</p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{profile.sectionTitle}</p>
              <p className="mt-3 max-w-3xl text-base leading-8 text-slate-300">
                {profile.sectionDescription}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {profile.showcaseItems.map((item) => (
                <Link
                  key={item.workId}
                  href={`/works/${item.workId}`}
                  className="block rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">{item.subtitle}</p>
                  <h2 className="mt-3 text-2xl font-medium text-white">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
