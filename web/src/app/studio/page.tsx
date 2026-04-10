import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthRoleCopy } from "@/features/auth/auth-copy";
import { getRequestAccessControl } from "@/features/auth/access-control";
import { PageHero } from "@/features/shell/page-hero";

export default async function StudioPage() {
  const accessControl = await getRequestAccessControl();
  const session = accessControl.session;

  if (session.status !== "authenticated" || !accessControl.studioGuard.allowed) {
    redirect(accessControl.studioGuard.redirectTo ?? "/login");
    return null;
  }

  const roleCopy = getAuthRoleCopy(session.primaryRole);

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <PageHero
          eyebrow="工作台"
          title={roleCopy?.studioTitle ?? "创作者工作台"}
          description="主页、作品、诉求、收件箱。"
          tone="utility"
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/studio/profile"
            className="museum-card block p-5"
          >
            <p className="museum-label">主页</p>
            <p className="font-display mt-4 text-3xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
              编辑公开主页
            </p>
          </Link>
          <Link
            href="/studio/works"
            className="museum-card block p-5"
          >
            <p className="museum-label">作品</p>
            <p className="font-display mt-4 text-3xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
              管理作品条目
            </p>
          </Link>
          <Link
            href="/studio/opportunities"
            className="museum-card block p-5"
          >
            <p className="museum-label">诉求</p>
            <p className="font-display mt-4 text-3xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
              发布约拍诉求
            </p>
          </Link>
          <Link
            href="/inbox"
            className="museum-card block p-5"
          >
            <p className="museum-label">收件箱</p>
            <p className="font-display mt-4 text-3xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
              打开收件箱
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
