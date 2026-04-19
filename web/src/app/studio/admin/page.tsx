import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getAdminAccountEmails } from "@/config/env";
import { getRequestAccessControl } from "@/features/auth/access-control";
import { PageHero } from "@/features/shell/page-hero";

export const metadata: Metadata = {
  title: "运营后台 | Lens Archive",
  robots: { index: false, follow: false },
};

const ENTRY_CARDS = [
  {
    href: "/studio/admin/curation",
    label: "精选位编排",
    description: "维护首页与发现页精选 slot；新增 / 删除 / 重排。",
  },
  {
    href: "/studio/admin/works",
    label: "作品审核",
    description: "对违规作品执行隐藏 / 恢复；操作即时生效，落审计。",
  },
  {
    href: "/studio/admin/audit",
    label: "审计日志",
    description: "查看最近 100 条管理员写动作的审计记录。",
  },
] as const;

export default async function AdminDashboardPage() {
  const access = await getRequestAccessControl();
  if (!access.adminGuard.allowed) {
    redirect(access.adminGuard.redirectTo ?? "/login");
  }

  const adminEmails = getAdminAccountEmails();
  const adminEmail = access.adminCapability.email;

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <p className="museum-label">运营后台 / 总览</p>
        <PageHero
          eyebrow="运营后台"
          title="总览"
          description="管理员可在这里完成精选位编排、作品违规处置与审计日志查看。"
          tone="utility"
        />

        <section className="museum-panel museum-panel--soft p-6 md:p-8">
          <p className="museum-label">当前管理员</p>
          <p className="mt-2 text-base text-[color:var(--accent-strong)]">
            {adminEmail ?? "—"}
          </p>
          <p className="mt-3 text-sm text-[color:var(--muted-strong)]">
            admin 名单大小：{adminEmails.size}
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ENTRY_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="museum-card block p-5"
            >
              <p className="museum-label">{card.label}</p>
              <p className="font-display mt-4 text-3xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
                {card.label}
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted-strong)]">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
