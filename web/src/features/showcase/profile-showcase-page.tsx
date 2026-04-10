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
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-12 pt-14">
        <header className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="museum-label">{getRoleLabel(profile.role)}主页</span>
                <span className="museum-tag">
                  Public Profile
                </span>
              </div>
              <h1 className="font-display max-w-4xl text-5xl leading-none tracking-[-0.04em] text-[color:var(--accent-strong)] sm:text-6xl lg:text-7xl">
                {profile.name}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[color:var(--muted-strong)] sm:text-lg">
                {profile.tagline}
              </p>
            </div>

            <div className="grid gap-4 text-sm text-[color:var(--muted-strong)] sm:grid-cols-3">
              <div className="museum-stat p-5">
                <p className="museum-label">城市</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">{profile.city}</p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">关注</p>
                {isSignedIn ? (
                  <form action={toggleProfileFollowAction.bind(null, profile.role, profile.slug, returnPath)}>
                    <button
                      type="submit"
                      className="museum-button-secondary mt-3"
                    >
                      {isFollowing ? "取消关注" : "关注这位创作者"}
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="museum-button-quiet mt-3 text-base">
                    登录后关注这位创作者
                  </Link>
                )}
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">合作联系</p>
                {isSignedIn ? (
                  <form action={startContactThreadAction.bind(null, profile.role, profile.slug, "profile", profile.slug)}>
                    <button
                      type="submit"
                      className="museum-button-primary mt-3"
                    >
                      发送关于这份主页的私信
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="museum-button-quiet mt-3 text-base"
                  >
                    {profile.contactLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="museum-panel p-6 md:p-7">
            <EditorialVisual
              assetRef={profile.heroAsset}
              label={profile.heroImageLabel}
              variant="portrait"
              description="以更安静的版面承接作品展示、关注关系和合作线索。"
              showSourceLabel
            />
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          <div className="museum-panel museum-panel--soft p-6 md:p-7">
            <p className="museum-label">主页介绍</p>
            <p className="mt-4 text-base leading-8 text-[color:var(--muted-strong)]">{profile.bio}</p>
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
                  className="museum-card block p-5"
                >
                  <EditorialVisual
                    assetRef={item.coverAsset}
                    label={item.subtitle}
                    variant="card"
                  />
                  <h2 className="font-display mt-5 text-3xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
