import { redirect } from "next/navigation";

import { getRequestAccessControl } from "@/features/auth/access-control";
import {
  OpportunityCard,
  getOpportunityOwnerLabel,
  getOpportunityVisualDescription,
} from "@/features/opportunities/opportunity-card";
import { PageHero } from "@/features/shell/page-hero";
import { getOpportunityPostsByRole } from "@/features/showcase/sample-data";

export default async function StudioOpportunitiesPage() {
  const accessControl = await getRequestAccessControl();
  const session = accessControl.session;

  if (session.status !== "authenticated" || !accessControl.studioGuard.allowed) {
    redirect(accessControl.studioGuard.redirectTo ?? "/login");
    return null;
  }

  const managedPosts = getOpportunityPostsByRole(session.primaryRole);
  const draft = managedPosts[0];
  const leadCoverAsset = managedPosts[0]?.coverAsset;

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <PageHero
          eyebrow="诉求"
          title="管理诉求"
          actions={[{ href: "/studio", label: "总览" }]}
          tone="utility"
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]">
          <form className="museum-panel grid gap-6 p-6 md:p-8">
            <label className="space-y-2">
              <span className="museum-label">标题</span>
              <input
                defaultValue={draft?.title}
                className="museum-field"
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="museum-label">城市</span>
                <input
                  defaultValue={draft?.city}
                  className="museum-field"
                />
              </label>
              <label className="space-y-2">
                <span className="museum-label">档期</span>
                <input
                  defaultValue={draft?.schedule}
                  className="museum-field"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="museum-label">摘要</span>
              <textarea
                defaultValue={draft?.summary}
                rows={5}
                className="museum-textarea"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="museum-button-primary"
              >
                发布
              </button>
              <button
                type="button"
                className="museum-button-secondary"
              >
                存草稿
              </button>
              <button
                type="button"
                className="museum-button-secondary"
              >
                下线
              </button>
            </div>
          </form>

          <div className="museum-panel museum-panel--soft p-6 md:p-8">
            <p className="museum-label">已发布</p>
            <div className="mt-5 grid gap-4">
              {managedPosts.map((post, index) => (
                <OpportunityCard
                  key={post.id}
                  assetRef={post.coverAsset}
                  visualLabel={getOpportunityOwnerLabel(post.ownerRole)}
                  visualDescription={getOpportunityVisualDescription(
                    post.city,
                    post.schedule,
                  )}
                  imageLoading={
                    index === 0 || post.coverAsset === leadCoverAsset
                      ? "eager"
                      : undefined
                  }
                  title={post.title}
                  summary={post.summary}
                  ownerName={post.ownerName}
                  footerTag="已发布"
                  titleTag="h2"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
