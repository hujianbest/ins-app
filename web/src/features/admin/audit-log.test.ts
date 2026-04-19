// @vitest-environment node
import { describe, expect, it } from "vitest";

import { formatAuditAction, formatAuditTargetKind } from "./audit-log";

describe("features/admin/audit-log > formatters", () => {
  it("returns Chinese label for known actions", () => {
    expect(formatAuditAction("curation.upsert")).toBe("新增 / 更新精选位");
    expect(formatAuditAction("curation.remove")).toBe("删除精选位");
    expect(formatAuditAction("curation.reorder")).toBe("重排精选位");
    expect(formatAuditAction("work_moderation.hide")).toBe("隐藏作品");
    expect(formatAuditAction("work_moderation.restore")).toBe("恢复作品");
  });

  it("returns Chinese label for known target kinds", () => {
    expect(formatAuditTargetKind("curation_slot")).toBe("精选位");
    expect(formatAuditTargetKind("work")).toBe("作品");
  });
});
