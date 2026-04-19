import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getRequestAccessControl } from "@/features/auth/access-control";
import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import type {
  CommunitySectionKind,
  CommunitySurface,
  CommunityTargetType,
  CuratedSlotRecord,
} from "@/features/community/types";
import {
  removeCuratedSlotForm,
  reorderCuratedSlotForm,
  upsertCuratedSlotForm,
} from "@/features/admin/curation-actions";
import { PageHero } from "@/features/shell/page-hero";
import { SectionHeading } from "@/features/shell/section-heading";

export const metadata: Metadata = {
  title: "运营后台 · 精选位编排 | Lens Archive",
  robots: { index: false, follow: false },
};

const ERROR_COPY: Record<string, string> = {
  invalid_curation_input: "输入字段不合法（surface / sectionKind / targetType / order）；操作未生效。",
  forbidden_admin_only: "当前账号没有管理员权限；操作未生效。",
  storage_failed: "数据写入失败；请稍后重试。",
};

const SURFACE_LABEL: Record<CommunitySurface, string> = {
  home: "首页 (home)",
  discover: "发现页 (discover)",
};

const SECTION_KIND_LABEL: Record<CommunitySectionKind, string> = {
  works: "作品 (works)",
  profiles: "创作者 (profiles)",
  opportunities: "约拍 (opportunities)",
};

const TARGET_TYPE_LABEL: Record<CommunityTargetType, string> = {
  work: "work",
  profile: "profile",
  opportunity: "opportunity",
};

async function resolveTargetDisplayName(
  bundle: ReturnType<typeof getDefaultCommunityRepositoryBundle>,
  slot: CuratedSlotRecord,
): Promise<string | null> {
  if (slot.targetType === "work") {
    const work = await bundle.works.getById(slot.targetKey);
    return work ? `${work.title} (${work.ownerName})` : null;
  }
  if (slot.targetType === "profile") {
    const profile = await bundle.profiles.getById(slot.targetKey);
    return profile ? `${profile.name} (${profile.role})` : null;
  }
  return slot.targetKey;
}

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

type SurfaceSlotRow = CuratedSlotRecord & { displayName: string | null };

async function loadSurfaceSlots(
  bundle: ReturnType<typeof getDefaultCommunityRepositoryBundle>,
  surface: CommunitySurface,
): Promise<SurfaceSlotRow[]> {
  const slots = await bundle.curation.listSlotsBySurface(surface);
  return Promise.all(
    slots.map(async (slot) => ({
      ...slot,
      displayName: await resolveTargetDisplayName(bundle, slot),
    })),
  );
}

function SlotTable({ surface, slots }: { surface: CommunitySurface; slots: SurfaceSlotRow[] }) {
  if (slots.length === 0) {
    return (
      <p className="mt-4 text-sm leading-6 text-[color:var(--muted-strong)]">
        该 surface 暂无精选 slot，使用下方表单添加。
      </p>
    );
  }
  return (
    <div className="museum-data-table-scroll mt-6 overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">{SURFACE_LABEL[surface]} 精选位列表</caption>
        <thead>
          <tr className="border-b border-[color:var(--border-faint)] text-[color:var(--muted-strong)]">
            <th scope="col" className="py-3 pr-4 font-medium">区块</th>
            <th scope="col" className="py-3 pr-4 font-medium">类型</th>
            <th scope="col" className="py-3 pr-4 font-medium">目标</th>
            <th scope="col" className="py-3 pr-4 font-medium">顺序</th>
            <th scope="col" className="py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr
              key={`${slot.surface}:${slot.sectionKind}:${slot.targetKey}`}
              className="border-b border-[color:var(--border-faint)]"
            >
              <td className="py-3 pr-4">
                <span className="museum-tag">{SECTION_KIND_LABEL[slot.sectionKind]}</span>
              </td>
              <td className="py-3 pr-4">
                <span className="museum-tag">{TARGET_TYPE_LABEL[slot.targetType]}</span>
              </td>
              <td className="py-3 pr-4">
                <div className="font-medium text-[color:var(--accent-strong)]">{slot.targetKey}</div>
                <div className="text-xs text-[color:var(--muted-strong)]">
                  {slot.displayName ?? "目标不存在 / 已下架"}
                </div>
              </td>
              <td className="py-3 pr-4">
                <form action={reorderCuratedSlotForm} className="flex items-center gap-2">
                  <input type="hidden" name="surface" value={slot.surface} />
                  <input type="hidden" name="sectionKind" value={slot.sectionKind} />
                  <input type="hidden" name="targetKey" value={slot.targetKey} />
                  <input
                    type="number"
                    min={0}
                    name="order"
                    defaultValue={slot.order}
                    className="museum-field w-16"
                    aria-label="顺序"
                  />
                  <button type="submit" className="museum-button-secondary text-xs">
                    重排
                  </button>
                </form>
              </td>
              <td className="py-3">
                <form action={removeCuratedSlotForm}>
                  <input type="hidden" name="surface" value={slot.surface} />
                  <input type="hidden" name="sectionKind" value={slot.sectionKind} />
                  <input type="hidden" name="targetKey" value={slot.targetKey} />
                  <button type="submit" className="museum-button-secondary text-xs">
                    删除
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddSlotForm({ surface }: { surface: CommunitySurface }) {
  return (
    <form
      action={upsertCuratedSlotForm}
      className="mt-6 grid gap-3 md:flex md:flex-wrap md:items-end md:gap-4"
    >
      <input type="hidden" name="surface" value={surface} />
      <label className="text-sm">
        <span className="museum-label block">区块 (sectionKind)</span>
        <select name="sectionKind" defaultValue="works" className="museum-field mt-1">
          <option value="works">作品 (works)</option>
          <option value="profiles">创作者 (profiles)</option>
          <option value="opportunities">约拍 (opportunities)</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="museum-label block">类型 (targetType)</span>
        <select name="targetType" defaultValue="work" className="museum-field mt-1">
          <option value="work">work</option>
          <option value="profile">profile</option>
          <option value="opportunity">opportunity</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="museum-label block">target key</span>
        <input
          type="text"
          name="targetKey"
          required
          className="museum-field mt-1 min-w-[16rem]"
          placeholder="如 work-id 或 photographer:slug"
        />
      </label>
      <label className="text-sm">
        <span className="museum-label block">顺序</span>
        <input
          type="number"
          name="order"
          min={0}
          defaultValue={1}
          className="museum-field mt-1 w-20"
        />
      </label>
      <button type="submit" className="museum-button-primary">
        添加
      </button>
    </form>
  );
}

export default async function AdminCurationPage({
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
  const [homeSlots, discoverSlots] = await Promise.all([
    loadSurfaceSlots(bundle, "home"),
    loadSurfaceSlots(bundle, "discover"),
  ]);

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <p className="museum-label">运营后台 / 精选位编排</p>
        <PageHero
          eyebrow="运营后台"
          title="精选位编排"
          description="维护首页与发现页的精选 slot；所有写动作都会落到审计日志。"
          tone="utility"
        />
        <ErrorAlert code={errorCode} />

        {(["home", "discover"] as const).map((surface) => (
          <section
            key={surface}
            className="museum-panel museum-panel--soft p-6 md:p-8"
          >
            <SectionHeading
              eyebrow="精选位编排"
              title={SURFACE_LABEL[surface]}
            />
            <SlotTable
              surface={surface}
              slots={surface === "home" ? homeSlots : discoverSlots}
            />
            <AddSlotForm surface={surface} />
          </section>
        ))}
      </section>
    </main>
  );
}
