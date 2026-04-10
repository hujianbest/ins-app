import { redirect } from "next/navigation";

import { getRequestAccessControl } from "@/features/auth/access-control";
import { saveStudioProfileAction } from "@/features/community/profile-actions";
import { getStudioProfileEditorModel } from "@/features/community/profile-editor";
import { PageHero } from "@/features/shell/page-hero";

export default async function StudioProfilePage() {
  const accessControl = await getRequestAccessControl();
  const session = accessControl.session;

  if (session.status !== "authenticated" || !accessControl.studioGuard.allowed) {
    redirect(accessControl.studioGuard.redirectTo ?? "/login");
    return null;
  }

  const profile = await getStudioProfileEditorModel(session.primaryRole);

  return (
    <main className="pb-24 text-white">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pt-12 sm:px-10 lg:px-14">
        <PageHero
          eyebrow="Studio Profile"
          title="编辑主页"
          description="完善你的公开身份信息，及时更新城市与定位，并打磨访客首先看到的主页内容。"
          actions={[{ href: "/studio", label: "返回工作台" }]}
        />

        <form
          action={saveStudioProfileAction}
          className="grid gap-6 rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.72)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl"
        >
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-white/45">展示名称</span>
            <input
              name="name"
              defaultValue={profile.name}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
            />
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/45">城市</span>
              <input
                name="city"
                defaultValue={profile.city}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/45">一句话介绍</span>
              <input
                name="tagline"
                defaultValue={profile.tagline}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-white/45">简介</span>
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
