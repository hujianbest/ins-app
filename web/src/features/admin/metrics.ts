import type { MetricsRegistry } from "@/features/observability/metrics";

/**
 * Phase 2 — Ops Back Office V1 (FR-008 / I-6).
 *
 * Single source of truth for the admin metrics counter key strings.
 * All admin server actions go through the helpers below; nothing in
 * the codebase should pass these key strings inline.
 */
export const ADMIN_COUNTER_NAMES = {
  curationAdded: "admin.curation.added",
  curationRemoved: "admin.curation.removed",
  curationReordered: "admin.curation.reordered",
  workModerationHidden: "admin.work_moderation.hidden",
  workModerationRestored: "admin.work_moderation.restored",
  auditAppended: "admin.audit.appended",
} as const;

export function incrementCurationAdded(
  registry: MetricsRegistry,
  count = 1,
): void {
  if (count <= 0) return;
  registry.incrementCounter(
    ADMIN_COUNTER_NAMES.curationAdded,
    undefined,
    count,
  );
}

export function incrementCurationRemoved(registry: MetricsRegistry): void {
  registry.incrementCounter(ADMIN_COUNTER_NAMES.curationRemoved);
}

export function incrementCurationReordered(registry: MetricsRegistry): void {
  registry.incrementCounter(ADMIN_COUNTER_NAMES.curationReordered);
}

export function incrementWorkModerationHidden(
  registry: MetricsRegistry,
): void {
  registry.incrementCounter(ADMIN_COUNTER_NAMES.workModerationHidden);
}

export function incrementWorkModerationRestored(
  registry: MetricsRegistry,
): void {
  registry.incrementCounter(ADMIN_COUNTER_NAMES.workModerationRestored);
}

export function incrementAuditAppended(registry: MetricsRegistry): void {
  registry.incrementCounter(ADMIN_COUNTER_NAMES.auditAppended);
}
