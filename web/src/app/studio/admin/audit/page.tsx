import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getRequestAccessControl } from "@/features/auth/access-control";
import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import {
  formatAuditAction,
  formatAuditTargetKind,
} from "@/features/admin/audit-log";
import { PageHero } from "@/features/shell/page-hero";
import { SectionHeading } from "@/features/shell/section-heading";

export const metadata: Metadata = {
  title: "运营后台 · 审计日志 | Lens Archive",
  robots: { index: false, follow: false },
};

const AUDIT_LIST_LIMIT = 100;

function formatHumanTime(iso: string) {
  // Best-effort human-readable rendering for SSR (UTC, no client locale data).
  return iso.replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

export default async function AdminAuditPage() {
  const access = await getRequestAccessControl();
  if (!access.adminGuard.allowed) {
    redirect(access.adminGuard.redirectTo ?? "/login");
  }

  const bundle = getDefaultCommunityRepositoryBundle();
  const entries = await bundle.audit.listLatest(AUDIT_LIST_LIMIT);

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <p className="museum-label">运营后台 / 审计日志</p>
        <PageHero
          eyebrow="运营后台"
          title="审计日志"
          description={`最近 ${AUDIT_LIST_LIMIT} 条审计记录（按时间倒序）。`}
          tone="utility"
        />

        <section className="museum-panel museum-panel--soft p-6 md:p-8">
          <SectionHeading
            eyebrow="审计记录"
            title="最新操作"
          />
          {entries.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-[color:var(--muted-strong)]">
              暂无审计记录。
            </p>
          ) : (
            <ul className="mt-6 grid gap-4">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="museum-stat p-5"
                >
                  <p className="museum-label">
                    <time dateTime={entry.createdAt}>
                      {formatHumanTime(entry.createdAt)}
                    </time>
                    <span className="ml-2 text-[color:var(--muted-strong)]">
                      · {entry.actorEmail}
                    </span>
                  </p>
                  <p className="mt-3 text-base text-[color:var(--accent-strong)]">
                    {formatAuditAction(entry.action)}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-strong)]">
                    {formatAuditTargetKind(entry.targetKind)}：
                    <span className="font-mono">{entry.targetId}</span>
                  </p>
                  {entry.note ? (
                    <p className="mt-2 text-xs text-[color:var(--muted-strong)]">
                      备注：{entry.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
