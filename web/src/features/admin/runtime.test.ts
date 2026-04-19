// @vitest-environment node
import { describe, expect, it } from "vitest";

import { AppError } from "@/features/observability/errors";

import { runAdminAction } from "./runtime";
import {
  createAdminTestDeps,
  fakeAdminSession,
  fakeGuestSession,
  fakeNonAdminSession,
} from "./test-support";

describe("features/admin/runtime > runAdminAction", () => {
  it("rejects guest sessions with forbidden_admin_only (I-3)", async () => {
    const deps = createAdminTestDeps();

    await expect(
      runAdminAction({
        actionName: "admin/curation/upsert",
        session: fakeGuestSession(),
        adminEmails: new Set(["admin@example.com"]),
        ...deps,
        fn: async () => "should not be called",
      }),
    ).rejects.toMatchObject({
      code: "forbidden_admin_only",
      status: 403,
    });

    expect(deps.capturedLogs.find((r) => r.event === "admin.action.completed")).toBeUndefined();
  });

  it("rejects non-admin authenticated sessions with forbidden_admin_only (I-3)", async () => {
    const deps = createAdminTestDeps();

    await expect(
      runAdminAction({
        actionName: "admin/work/hide",
        session: fakeNonAdminSession("user@example.com"),
        adminEmails: new Set(["admin@example.com"]),
        ...deps,
        fn: async () => "should not be called",
      }),
    ).rejects.toMatchObject({
      code: "forbidden_admin_only",
    });
  });

  it("invokes fn and writes admin.action.completed log on success", async () => {
    const deps = createAdminTestDeps();

    const result = await runAdminAction({
      actionName: "admin/curation/upsert",
      session: fakeAdminSession("admin@example.com"),
      adminEmails: new Set(["admin@example.com"]),
      ...deps,
      fn: async (ctx) => {
        expect(ctx.capability.isAdmin).toBe(true);
        expect(ctx.capability.email).toBe("admin@example.com");
        return "ok";
      },
    });

    expect(result).toBe("ok");
    const completed = deps.capturedLogs.find(
      (r) => r.event === "admin.action.completed" && r.level === "info",
    );
    expect(completed).toBeDefined();
    // actorEmail must NEVER appear in log fields (NFR-002)
    const ctx = completed?.ctx as Record<string, unknown> | undefined;
    expect(ctx).toMatchObject({
      module: "admin",
      actionName: "admin/curation/upsert",
    });
    expect(JSON.stringify(ctx ?? {})).not.toContain("admin@example.com");
  });

  it("writes admin.action.failed warn log and rethrows when fn throws (I-3)", async () => {
    const deps = createAdminTestDeps();

    await expect(
      runAdminAction({
        actionName: "admin/work/hide",
        session: fakeAdminSession("admin@example.com"),
        adminEmails: new Set(["admin@example.com"]),
        ...deps,
        fn: async () => {
          throw new AppError({ code: "work_not_found", status: 404 });
        },
      }),
    ).rejects.toMatchObject({ code: "work_not_found", status: 404 });

    const failed = deps.capturedLogs.find(
      (r) => r.event === "admin.action.failed" && r.level === "warn",
    );
    expect(failed).toBeDefined();
  });

  it("falls back to direct execution when bundle has no withTransaction (in-memory bundle)", async () => {
    const deps = createAdminTestDeps();
    let invoked = false;

    await runAdminAction({
      actionName: "admin/curation/upsert",
      session: fakeAdminSession("admin@example.com"),
      adminEmails: new Set(["admin@example.com"]),
      ...deps,
      fn: async () => {
        invoked = true;
        return "ok";
      },
    });

    expect(invoked).toBe(true);
  });

  it("uses bundle.withTransaction when available and rolls back on fn error", async () => {
    const deps = createAdminTestDeps();
    let begun = 0;
    let committed = 0;
    let rolledBack = 0;
    const txBundle = {
      ...deps.bundle,
      async withTransaction<T>(fn: () => Promise<T> | T): Promise<T> {
        begun++;
        try {
          const r = await fn();
          committed++;
          return r;
        } catch (e) {
          rolledBack++;
          throw e;
        }
      },
    };

    // success path
    await runAdminAction({
      actionName: "admin/curation/upsert",
      session: fakeAdminSession("admin@example.com"),
      adminEmails: new Set(["admin@example.com"]),
      bundle: txBundle,
      metrics: deps.metrics,
      logger: deps.logger,
      capturedLogs: deps.capturedLogs,
      fn: async () => "ok",
    });

    expect(begun).toBe(1);
    expect(committed).toBe(1);
    expect(rolledBack).toBe(0);

    // failure path
    await expect(
      runAdminAction({
        actionName: "admin/work/hide",
        session: fakeAdminSession("admin@example.com"),
        adminEmails: new Set(["admin@example.com"]),
        bundle: txBundle,
        metrics: deps.metrics,
        logger: deps.logger,
        capturedLogs: deps.capturedLogs,
        fn: async () => {
          throw new Error("boom");
        },
      }),
    ).rejects.toThrow("boom");

    expect(begun).toBe(2);
    expect(committed).toBe(1);
    expect(rolledBack).toBe(1);
  });
});
