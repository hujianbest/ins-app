"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  isCommunitySectionKind,
  isCommunitySurface,
  isCommunityTargetType,
} from "@/features/community/contracts";
import type {
  CommunitySectionKind,
  CommunitySurface,
  CommunityTargetType,
} from "@/features/community/types";
import { AppError } from "@/features/observability/errors";
import { wrapServerAction } from "@/features/observability/server-boundary";

import {
  incrementAuditAppended,
  incrementCurationAdded,
  incrementCurationRemoved,
  incrementCurationReordered,
} from "./metrics";
import {
  type RunAdminActionOptions,
  runAdminAction,
} from "./runtime";

type AdminActionDeps = Omit<RunAdminActionOptions<unknown>, "actionName" | "fn">;

function readString(formData: FormData, name: string): string {
  const raw = formData.get(name);
  return typeof raw === "string" ? raw.trim() : "";
}

function readSurface(formData: FormData): CommunitySurface {
  const raw = readString(formData, "surface");
  if (!isCommunitySurface(raw)) {
    throw new AppError({
      code: "invalid_curation_input",
      message: "Invalid surface.",
      status: 400,
    });
  }
  return raw;
}

function readSectionKind(formData: FormData): CommunitySectionKind {
  const raw = readString(formData, "sectionKind");
  if (!isCommunitySectionKind(raw)) {
    throw new AppError({
      code: "invalid_curation_input",
      message: "Invalid sectionKind.",
      status: 400,
    });
  }
  return raw;
}

function readTargetType(formData: FormData): CommunityTargetType {
  const raw = readString(formData, "targetType");
  if (!isCommunityTargetType(raw)) {
    throw new AppError({
      code: "invalid_curation_input",
      message: "Invalid targetType.",
      status: 400,
    });
  }
  return raw;
}

function readTargetKey(formData: FormData): string {
  const raw = readString(formData, "targetKey");
  if (!raw) {
    throw new AppError({
      code: "invalid_curation_input",
      message: "Missing targetKey.",
      status: 400,
    });
  }
  return raw;
}

function readOrder(formData: FormData): number {
  const raw = readString(formData, "order");
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    throw new AppError({
      code: "invalid_curation_input",
      message: "Invalid order.",
      status: 400,
    });
  }
  return parsed;
}

async function targetExists(
  bundle: NonNullable<AdminActionDeps["bundle"]>,
  targetType: CommunityTargetType,
  targetKey: string,
): Promise<boolean> {
  if (targetType === "work") {
    return Boolean(await bundle.works.getById(targetKey));
  }
  if (targetType === "profile") {
    // targetKey for profiles is `${role}:${slug}` per existing seed convention.
    const profile = await bundle.profiles.getById(targetKey);
    return Boolean(profile);
  }
  // opportunity targets: not validated against repository in V1 (no opportunities repo on bundle)
  return true;
}

async function upsertCuratedSlotImpl(
  formData: FormData,
  deps?: AdminActionDeps,
): Promise<void> {
  const surface = readSurface(formData);
  const sectionKind = readSectionKind(formData);
  const targetType = readTargetType(formData);
  const targetKey = readTargetKey(formData);
  const order = readOrder(formData);

  await runAdminAction({
    actionName: "admin/curation/upsert",
    ...(deps ?? {}),
    fn: async (ctx) => {
      await ctx.bundle.curation.upsertSlot({
        surface,
        sectionKind,
        targetType,
        targetKey,
        order,
      });

      const exists = await targetExists(ctx.bundle, targetType, targetKey);
      const note = exists ? undefined : "target_not_found_at_write";

      await ctx.bundle.audit.record({
        actorAccountId: ctx.session.status === "authenticated"
          ? ctx.session.accountId
          : "",
        actorEmail: ctx.capability.email,
        action: "curation.upsert",
        targetKind: "curation_slot",
        targetId: `${surface}:${sectionKind}:${targetKey}`,
        note,
      });

      incrementCurationAdded(ctx.metrics);
      incrementAuditAppended(ctx.metrics);
    },
  });
}

async function removeCuratedSlotImpl(
  formData: FormData,
  deps?: AdminActionDeps,
): Promise<void> {
  const surface = readSurface(formData);
  const sectionKind = readSectionKind(formData);
  const targetKey = readTargetKey(formData);

  await runAdminAction({
    actionName: "admin/curation/remove",
    ...(deps ?? {}),
    fn: async (ctx) => {
      await ctx.bundle.curation.removeSlot({ surface, sectionKind, targetKey });
      await ctx.bundle.audit.record({
        actorAccountId: ctx.session.status === "authenticated"
          ? ctx.session.accountId
          : "",
        actorEmail: ctx.capability.email,
        action: "curation.remove",
        targetKind: "curation_slot",
        targetId: `${surface}:${sectionKind}:${targetKey}`,
      });
      incrementCurationRemoved(ctx.metrics);
      incrementAuditAppended(ctx.metrics);
    },
  });
}

async function reorderCuratedSlotImpl(
  formData: FormData,
  deps?: AdminActionDeps,
): Promise<void> {
  const surface = readSurface(formData);
  const sectionKind = readSectionKind(formData);
  const targetKey = readTargetKey(formData);
  const order = readOrder(formData);

  await runAdminAction({
    actionName: "admin/curation/reorder",
    ...(deps ?? {}),
    fn: async (ctx) => {
      const updated = await ctx.bundle.curation.reorderSlot({
        surface,
        sectionKind,
        targetKey,
        order,
      });
      if (!updated) {
        throw new AppError({
          code: "invalid_curation_input",
          message: "Curation slot not found.",
          status: 400,
        });
      }
      await ctx.bundle.audit.record({
        actorAccountId: ctx.session.status === "authenticated"
          ? ctx.session.accountId
          : "",
        actorEmail: ctx.capability.email,
        action: "curation.reorder",
        targetKind: "curation_slot",
        targetId: `${surface}:${sectionKind}:${targetKey}`,
      });
      incrementCurationReordered(ctx.metrics);
      incrementAuditAppended(ctx.metrics);
    },
  });
}

/**
 * Phase 2 — Ops Back Office V1 (FR-003).
 *
 * Form-action entry. When invoked from the admin curation page,
 * deps is omitted and the helpers default to real session / bundle
 * / metrics / logger; tests inject deps directly.
 */
export const upsertCuratedSlot = wrapServerAction(
  "admin/curation/upsert",
  upsertCuratedSlotImpl as (
    formData: FormData,
    deps?: AdminActionDeps,
  ) => Promise<void>,
);

export const removeCuratedSlot = wrapServerAction(
  "admin/curation/remove",
  removeCuratedSlotImpl as (
    formData: FormData,
    deps?: AdminActionDeps,
  ) => Promise<void>,
);

export const reorderCuratedSlot = wrapServerAction(
  "admin/curation/reorder",
  reorderCuratedSlotImpl as (
    formData: FormData,
    deps?: AdminActionDeps,
  ) => Promise<void>,
);

/**
 * Convenience form action that wraps the upsert + redirects on
 * success. Not used by tests (they call the action directly), but
 * suitable for the admin curation page form.
 */
export async function upsertCuratedSlotForm(formData: FormData) {
  try {
    await upsertCuratedSlot(formData);
    revalidatePath("/studio/admin/curation");
    redirect("/studio/admin/curation");
  } catch (error) {
    const code =
      error instanceof AppError ? error.code : "storage_failed";
    redirect(`/studio/admin/curation?error=${encodeURIComponent(code)}`);
  }
}

export async function removeCuratedSlotForm(formData: FormData) {
  try {
    await removeCuratedSlot(formData);
    revalidatePath("/studio/admin/curation");
    redirect("/studio/admin/curation");
  } catch (error) {
    const code =
      error instanceof AppError ? error.code : "storage_failed";
    redirect(`/studio/admin/curation?error=${encodeURIComponent(code)}`);
  }
}

export async function reorderCuratedSlotForm(formData: FormData) {
  try {
    await reorderCuratedSlot(formData);
    revalidatePath("/studio/admin/curation");
    redirect("/studio/admin/curation");
  } catch (error) {
    const code =
      error instanceof AppError ? error.code : "storage_failed";
    redirect(`/studio/admin/curation?error=${encodeURIComponent(code)}`);
  }
}
