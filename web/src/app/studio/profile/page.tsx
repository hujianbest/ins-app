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
    <main className="museum-page">
      <section className="museum-shell flex max-w-5xl flex-col gap-10 pt-14">
        <PageHero
          eyebrow="主页"
          title="编辑主页"
          actions={[{ href: "/studio", label: "总览" }]}
          tone="utility"
        />

        <form
          action={saveStudioProfileAction}
          className="museum-panel grid gap-6 p-6 md:p-8"
        >
          <label className="space-y-2">
            <span className="museum-label">名称</span>
            <input
              name="name"
              defaultValue={profile.name}
              className="museum-field"
            />
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="museum-label">城市</span>
              <input
                name="city"
                defaultValue={profile.city}
                className="museum-field"
              />
            </label>
            <label className="space-y-2">
              <span className="museum-label">短句</span>
              <input
                name="tagline"
                defaultValue={profile.tagline}
                className="museum-field"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="museum-label">简介</span>
            <textarea
              name="bio"
              defaultValue={profile.bio}
              rows={6}
              className="museum-textarea"
            />
          </label>

          <button
            type="submit"
            className="museum-button-primary w-fit"
          >
            保存
          </button>
        </form>
      </section>
    </main>
  );
}
