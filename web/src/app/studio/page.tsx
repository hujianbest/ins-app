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
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">已登录工作台</p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            {roleCopy?.studioTitle ?? "创作者工作台"}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            你的主身份已经激活。通过这个受保护的入口继续进入主页编辑、作品管理、诉求发布和站内收件箱。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/studio/profile"
            className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">主页</p>
            <p className="mt-3 text-2xl font-medium text-white">编辑公开主页</p>
          </Link>
          <Link
            href="/studio/works"
            className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">作品</p>
            <p className="mt-3 text-2xl font-medium text-white">管理作品条目</p>
          </Link>
          <Link
            href="/studio/opportunities"
            className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">诉求</p>
            <p className="mt-3 text-2xl font-medium text-white">发布约拍诉求</p>
          </Link>
          <Link
            href="/inbox"
            className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">收件箱</p>
            <p className="mt-3 text-2xl font-medium text-white">打开收件箱</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
