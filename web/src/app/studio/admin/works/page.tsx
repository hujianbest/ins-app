import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getRequestAccessControl } from "@/features/auth/access-control";
import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import type {
  CommunityWorkRecord,
  CommunityWorkStatus,
} from "@/features/community/types";
import {
  hideWorkForm,
  restoreWorkForm,
} from "@/features/admin/work-moderation-actions";
import { PageHero } from "@/features/shell/page-hero";
import { SectionHeading } from "@/features/shell/section-heading";

export const metadata: Metadata = {
  title: "运营后台 · 作品审核 | Lens Archive",
  robots: { index: false, follow: false },
};

const ERROR_COPY: Record<string, string> = {
  invalid_work_status_transition: "该作品当前状态不允许此操作；操作未生效。",
  forbidden_admin_only: "当前账号没有管理员权限；操作未生效。",
  work_not_found: "未找到对应作品；操作未生效。",
  storage_failed: "数据写入失败；请稍后重试。",
};

const STATUS_LABEL: Record<CommunityWorkStatus, string> = {
  draft: "草稿",
  published: "已发布",
  moderated: "已隐藏",
};

function ErrorAlert({ code }: { code: string | null }) {
  if (!code) return null;
  const message = ERROR_COPY[code] ?? "操作失败，请稍后重试。";
  return (
    <div
      role="alert"
      aria-live="polite"
      className="museum-tag mt-4 block max-w-3xl text-sm leading-6 text-[color:var(--accent-strong)]"
    >
      {message}（错误码：{code}）
    </div>
  );
}

function StatusTag({ status }: { status: CommunityWorkStatus }) {
  return <span className="museum-tag">{STATUS_LABEL[status]}</span>;
}

function WorkActionForm({ work }: { work: CommunityWorkRecord }) {
  if (work.status === "published") {
    return (
      <form action={hideWorkForm}>
        <input type="hidden" name="workId" value={work.id} />
        <button type="submit" className="museum-button-secondary text-xs">
          隐藏
        </button>
      </form>
    );
  }
  if (work.status === "moderated") {
    return (
      <form action={restoreWorkForm}>
        <input type="hidden" name="workId" value={work.id} />
        <button type="submit" className="museum-button-secondary text-xs">
          恢复
        </button>
      </form>
    );
  }
  return (
    <span className="text-xs text-[color:var(--muted-strong)]">—</span>
  );
}

function WorksTable({ works }: { works: CommunityWorkRecord[] }) {
  if (works.length === 0) {
    return (
      <p className="mt-4 text-sm leading-6 text-[color:var(--muted-strong)]">
        全库暂无作品。
      </p>
    );
  }
  if (works.every((w) => w.status === "draft")) {
    return (
      <p className="mt-4 text-sm leading-6 text-[color:var(--muted-strong)]">
        全库仅有草稿作品，本页面无可处置作品。
      </p>
    );
  }
  return (
    <div className="museum-data-table-scroll mt-6 overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">所有作品列表（含草稿 / 已发布 / 已隐藏）</caption>
        <thead>
          <tr className="border-b border-[color:var(--border-faint)] text-[color:var(--muted-strong)]">
            <th scope="col" className="py-3 pr-4 font-medium">标题</th>
            <th scope="col" className="py-3 pr-4 font-medium">作者</th>
            <th scope="col" className="py-3 pr-4 font-medium">状态</th>
            <th scope="col" className="py-3 pr-4 font-medium">最近更新</th>
            <th scope="col" className="py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {works.map((work) => (
            <tr
              key={work.id}
              className="border-b border-[color:var(--border-faint)]"
            >
              <td className="py-3 pr-4">
                <div className="font-medium text-[color:var(--accent-strong)]">{work.title}</div>
                <div className="text-xs text-[color:var(--muted-strong)]">{work.id}</div>
              </td>
              <td className="py-3 pr-4">{work.ownerName}</td>
              <td className="py-3 pr-4">
                <StatusTag status={work.status} />
              </td>
              <td className="py-3 pr-4 whitespace-nowrap text-[color:var(--muted-strong)]">
                {work.updatedAt ?? work.publishedAt ?? "—"}
              </td>
              <td className="py-3">
                <WorkActionForm work={work} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const access = await getRequestAccessControl();
  if (!access.adminGuard.allowed) {
    redirect(access.adminGuard.redirectTo ?? "/login");
  }

  const params = (await searchParams) ?? {};
  const errorParam = params.error;
  const errorCode =
    typeof errorParam === "string"
      ? errorParam
      : Array.isArray(errorParam)
        ? errorParam[0] ?? null
        : null;

  const bundle = getDefaultCommunityRepositoryBundle();
  const works = await bundle.works.listAllForAdmin();

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <p className="museum-label">运营后台 / 作品审核</p>
        <PageHero
          eyebrow="运营后台"
          title="作品审核"
          description="对违规作品执行隐藏 / 恢复；操作即时生效，所有写动作落审计。"
          tone="utility"
        />
        <ErrorAlert code={errorCode} />

        <section className="museum-panel museum-panel--soft p-6 md:p-8">
          <SectionHeading
            eyebrow="作品列表"
            title="所有作品"
          />
          <WorksTable works={works} />
        </section>
      </section>
    </main>
  );
}
