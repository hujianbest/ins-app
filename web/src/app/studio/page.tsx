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
    <main className="pb-24 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pt-12 sm:px-10 lg:px-14">
        <PageHero
          eyebrow="Creator Workspace"
          title={roleCopy?.studioTitle ?? "创作者工作台"}
          description="你的主身份已经激活。通过这个受保护的入口继续进入主页编辑、作品管理、诉求发布和站内收件箱。"
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/studio/profile"
            className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-[rgba(255,255,255,0.08)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">主页</p>
            <p className="mt-3 text-2xl font-medium text-white">编辑公开主页</p>
          </Link>
          <Link
            href="/studio/works"
            className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-[rgba(255,255,255,0.08)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">作品</p>
            <p className="mt-3 text-2xl font-medium text-white">管理作品条目</p>
          </Link>
          <Link
            href="/studio/opportunities"
            className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-[rgba(255,255,255,0.08)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">诉求</p>
            <p className="mt-3 text-2xl font-medium text-white">发布约拍诉求</p>
          </Link>
          <Link
            href="/inbox"
            className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-[rgba(255,255,255,0.08)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">收件箱</p>
            <p className="mt-3 text-2xl font-medium text-white">打开收件箱</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
