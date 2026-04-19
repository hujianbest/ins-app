"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AppError } from "@/features/observability/errors";
import { wrapServerAction } from "@/features/observability/server-boundary";

import {
  incrementAuditAppended,
  incrementWorkModerationHidden,
  incrementWorkModerationRestored,
} from "./metrics";
import {
  type RunAdminActionOptions,
  runAdminAction,
} from "./runtime";

type AdminActionDeps = Omit<RunAdminActionOptions<unknown>, "actionName" | "fn">;

async function transitionWork(
  workId: string,
  expectedStatus: "published" | "moderated",
  nextStatus: "published" | "moderated",
  auditAction: "work_moderation.hide" | "work_moderation.restore",
  deps: AdminActionDeps | undefined,
): Promise<void> {
  await runAdminAction({
    actionName:
      auditAction === "work_moderation.hide"
        ? "admin/work/hide"
        : "admin/work/restore",
    ...(deps ?? {}),
    fn: async (ctx) => {
      const existing = await ctx.bundle.works.getById(workId);
      if (!existing) {
        throw new AppError({
          code: "work_not_found",
          message: "Work not found.",
          status: 404,
        });
      }
      if (existing.status !== expectedStatus) {
        throw new AppError({
          code: "invalid_work_status_transition",
          message: "Invalid work status transition.",
          status: 400,
        });
      }

      await ctx.bundle.works.save({
        ...existing,
        status: nextStatus,
        // hide: keep publishedAt so restore can put it back unchanged.
        // restore: keep publishedAt; do NOT set a new one (we want to
        // preserve the original publish moment for sort ordering).
        publishedAt: existing.publishedAt,
        updatedAt: new Date().toISOString(),
      });

      await ctx.bundle.audit.record({
        actorAccountId:
          ctx.session.status === "authenticated" ? ctx.session.accountId : "",
        actorEmail: ctx.capability.email,
        action: auditAction,
        targetKind: "work",
        targetId: workId,
      });

      if (auditAction === "work_moderation.hide") {
        incrementWorkModerationHidden(ctx.metrics);
      } else {
        incrementWorkModerationRestored(ctx.metrics);
      }
      incrementAuditAppended(ctx.metrics);
    },
  });
}

async function hideWorkImpl(
  workId: string,
  deps?: AdminActionDeps,
): Promise<void> {
  await transitionWork(workId, "published", "moderated", "work_moderation.hide", deps);
}

async function restoreWorkImpl(
  workId: string,
  deps?: AdminActionDeps,
): Promise<void> {
  await transitionWork(workId, "moderated", "published", "work_moderation.restore", deps);
}

/**
 * Phase 2 — Ops Back Office V1 (FR-004).
 *
 * Form-action entry. When invoked from the admin works page, deps
 * is omitted; tests pass deps directly.
 */
export const hideWork = wrapServerAction(
  "admin/work/hide",
  hideWorkImpl as (workId: string, deps?: AdminActionDeps) => Promise<void>,
);

export const restoreWork = wrapServerAction(
  "admin/work/restore",
  restoreWorkImpl as (workId: string, deps?: AdminActionDeps) => Promise<void>,
);

export async function hideWorkForm(formData: FormData) {
  const workId = String(formData.get("workId") ?? "").trim();
  try {
    await hideWork(workId);
    revalidatePath("/studio/admin/works");
    redirect("/studio/admin/works");
  } catch (error) {
    const code = error instanceof AppError ? error.code : "storage_failed";
    redirect(`/studio/admin/works?error=${encodeURIComponent(code)}`);
  }
}

export async function restoreWorkForm(formData: FormData) {
  const workId = String(formData.get("workId") ?? "").trim();
  try {
    await restoreWork(workId);
    revalidatePath("/studio/admin/works");
    redirect("/studio/admin/works");
  } catch (error) {
    const code = error instanceof AppError ? error.code : "storage_failed";
    redirect(`/studio/admin/works?error=${encodeURIComponent(code)}`);
  }
}
