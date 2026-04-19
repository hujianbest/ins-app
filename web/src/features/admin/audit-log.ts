/**
 * Phase 2 — Ops Back Office V1 (FR-005).
 *
 * Convenience re-exports + display helpers for the audit log. The
 * actual sqlite repository lives in `community/sqlite.ts > bundle.audit`.
 */
export type {
  AuditAction,
  AuditTargetKind,
  AuditLogEntry,
  AuditLogCreateInput,
  AuditLogRepository,
} from "@/features/community/types";

import type { AuditAction, AuditTargetKind } from "@/features/community/types";

const ACTION_LABEL: Record<AuditAction, string> = {
  "curation.upsert": "新增 / 更新精选位",
  "curation.remove": "删除精选位",
  "curation.reorder": "重排精选位",
  "work_moderation.hide": "隐藏作品",
  "work_moderation.restore": "恢复作品",
};

const TARGET_KIND_LABEL: Record<AuditTargetKind, string> = {
  curation_slot: "精选位",
  work: "作品",
};

export function formatAuditAction(action: AuditAction): string {
  return ACTION_LABEL[action] ?? action;
}

export function formatAuditTargetKind(kind: AuditTargetKind): string {
  return TARGET_KIND_LABEL[kind] ?? kind;
}
