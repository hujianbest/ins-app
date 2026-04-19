// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

import {
  type MetricsRegistry,
  createMetricsRegistry,
} from "@/features/observability/metrics";

import {
  ADMIN_COUNTER_NAMES,
  incrementAuditAppended,
  incrementCurationAdded,
  incrementCurationRemoved,
  incrementCurationReordered,
  incrementWorkModerationHidden,
  incrementWorkModerationRestored,
} from "./metrics";

let registry: MetricsRegistry;

beforeEach(() => {
  registry = createMetricsRegistry();
});

describe("features/admin/metrics counter key constants", () => {
  it("exposes the canonical 6 counter keys", () => {
    expect(ADMIN_COUNTER_NAMES).toEqual({
      curationAdded: "admin.curation.added",
      curationRemoved: "admin.curation.removed",
      curationReordered: "admin.curation.reordered",
      workModerationHidden: "admin.work_moderation.hidden",
      workModerationRestored: "admin.work_moderation.restored",
      auditAppended: "admin.audit.appended",
    });
  });
});

describe("features/admin/metrics helpers", () => {
  it("incrementCurationAdded routes to admin.curation.added", () => {
    incrementCurationAdded(registry, 2);
    expect(registry.snapshot().admin.curation.added).toBe(2);
  });

  it("incrementCurationRemoved routes to admin.curation.removed", () => {
    incrementCurationRemoved(registry);
    expect(registry.snapshot().admin.curation.removed).toBe(1);
  });

  it("incrementCurationReordered routes to admin.curation.reordered", () => {
    incrementCurationReordered(registry);
    expect(registry.snapshot().admin.curation.reordered).toBe(1);
  });

  it("incrementWorkModerationHidden routes to admin.work_moderation.hidden", () => {
    incrementWorkModerationHidden(registry);
    expect(registry.snapshot().admin.work_moderation.hidden).toBe(1);
  });

  it("incrementWorkModerationRestored routes to admin.work_moderation.restored", () => {
    incrementWorkModerationRestored(registry);
    expect(registry.snapshot().admin.work_moderation.restored).toBe(1);
  });

  it("incrementAuditAppended routes to admin.audit.appended", () => {
    incrementAuditAppended(registry);
    incrementAuditAppended(registry);
    expect(registry.snapshot().admin.audit.appended).toBe(2);
  });

  it("ignores zero / negative counts on cards-style helpers", () => {
    incrementCurationAdded(registry, 0);
    incrementCurationAdded(registry, -3);
    expect(registry.snapshot().admin.curation.added).toBe(0);
  });
});
