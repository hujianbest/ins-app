import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import { getWorksByRole } from "@/features/showcase/sample-data";

export default async function StudioWorksPage() {
  const sessionRole = await getSessionRole();

  if (!sessionRole) {
    redirect("/login");
    return null;
  }

  const managedWorks = getWorksByRole(sessionRole);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.18),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0f172a_56%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">工作台作品</p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">管理作品</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">
              查看当前挂载在公开主页上的作品，并为展示区准备下一批新增内容。
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/studio" className="text-sm uppercase tracking-[0.28em] text-cyan-200 transition hover:text-white">
              返回工作台
            </Link>
            <button
              type="button"
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
            >
              添加新作品
            </button>
          </div>
        </div>

        <div className="grid gap-5">
          {managedWorks.map((work) => (
            <article
              key={work.id}
              className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{work.category}</p>
                <h2 className="mt-3 text-2xl font-medium text-white">{work.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{work.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-cyan-200/50 hover:text-cyan-200"
                >
                  编辑
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-cyan-200/50 hover:text-cyan-200"
                >
                  预览
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
