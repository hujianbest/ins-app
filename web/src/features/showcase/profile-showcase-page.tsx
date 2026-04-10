import Link from "next/link";

import { EditorialVisual } from "@/features/shell/editorial-visual";
import { startContactThreadAction } from "@/features/contact/actions";
import { SectionHeading } from "@/features/shell/section-heading";
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
    <main className="pb-24 text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pt-12 sm:px-10 lg:px-14">
        <header className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-white/45">
                <span>{getRoleLabel(profile.role)}主页</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-cyan-200/80">
                  Public Profile
                </span>
              </div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {profile.name}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {profile.tagline}
              </p>
            </div>

            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">城市</p>
                <p className="mt-3 text-base text-white">{profile.city}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">关注</p>
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
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">合作联系</p>
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

          <div className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.72)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <EditorialVisual
              assetRef={profile.heroAsset}
              label={profile.heroImageLabel}
              aspectClassName="aspect-[4/5]"
              description="用更成熟的公开信息层级承接作品展示、关注关系和合作线索。"
              showSourceLabel
            />
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.7)] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">主页介绍</p>
            <p className="mt-4 text-base leading-8 text-slate-300">{profile.bio}</p>
          </div>

          <div className="space-y-5">
            <SectionHeading
              eyebrow={profile.sectionTitle}
              title="已发布作品与公开展示"
              description={profile.sectionDescription}
            />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {profile.showcaseItems.map((item) => (
                <Link
                  key={item.workId}
                  href={`/works/${item.workId}`}
                  className="block rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-[rgba(255,255,255,0.08)]"
                >
                  <EditorialVisual
                    assetRef={item.coverAsset}
                    label={item.subtitle}
                    aspectClassName="aspect-[4/3]"
                    className="rounded-[1.25rem]"
                  />
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
