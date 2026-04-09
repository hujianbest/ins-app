import Link from "next/link";
import { redirect } from "next/navigation";

import { getRequestAccessControl } from "@/features/auth/access-control";
import { saveStudioProfileAction } from "@/features/community/profile-actions";
import { getStudioProfileEditorModel } from "@/features/community/profile-editor";

export default async function StudioProfilePage() {
  const accessControl = await getRequestAccessControl();
  const session = accessControl.session;

  if (session.status !== "authenticated" || !accessControl.studioGuard.allowed) {
    redirect(accessControl.studioGuard.redirectTo ?? "/login");
    return null;
  }

  const profile = await getStudioProfileEditorModel(session.primaryRole);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.18),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0f172a_56%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">工作台主页</p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">编辑主页</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">
              完善你的公开身份信息，及时更新城市与定位，并打磨访客首先看到的主页内容。
            </p>
          </div>
          <Link href="/studio" className="text-sm uppercase tracking-[0.28em] text-cyan-200 transition hover:text-white">
            返回工作台
          </Link>
        </div>

        <form
          action={saveStudioProfileAction}
          className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur"
        >
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-white/50">展示名称</span>
            <input
              name="name"
              defaultValue={profile.name}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
            />
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/50">城市</span>
              <input
                name="city"
                defaultValue={profile.city}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/50">一句话介绍</span>
              <input
                name="tagline"
                defaultValue={profile.tagline}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-white/50">简介</span>
            <textarea
              name="bio"
              defaultValue={profile.bio}
              rows={6}
              className="w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-base leading-7 text-white outline-none"
            />
          </label>

          <button
            type="submit"
            className="inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
          >
            保存主页更改
          </button>
        </form>
      </section>
    </main>
  );
}
