// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { hideWork, restoreWork } from "./work-moderation-actions";
import {
  createAdminTestDeps,
  fakeAdminSession,
  fakeNonAdminSession,
} from "./test-support";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_EMAILS = new Set([ADMIN_EMAIL]);

function publishedWork(id: string, ownerProfileId = "photographer:owner") {
  return {
    id,
    ownerProfileId,
    ownerRole: "photographer" as const,
    ownerSlug: ownerProfileId.split(":")[1],
    ownerName: "Owner",
    status: "published" as const,
    title: `Work ${id}`,
    category: "portrait",
    description: "",
    detailNote: "",
    coverAsset: "",
    publishedAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
  };
}

function moderatedWork(id: string, ownerProfileId = "photographer:owner") {
  return {
    ...publishedWork(id, ownerProfileId),
    status: "moderated" as const,
  };
}

function draftWork(id: string, ownerProfileId = "photographer:owner") {
  return {
    ...publishedWork(id, ownerProfileId),
    status: "draft" as const,
  };
}

describe("admin/work-moderation-actions > hideWork", () => {
  it("rejects non-admin callers", async () => {
    const deps = createAdminTestDeps({ works: [publishedWork("w1")] });
    await expect(
      hideWork("w1", {
        session: fakeNonAdminSession("u@example.com"),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      }),
    ).rejects.toMatchObject({ code: "forbidden_admin_only" });
  });

  it("rejects unknown workId with work_not_found", async () => {
    const deps = createAdminTestDeps({ works: [publishedWork("w1")] });
    await expect(
      hideWork("missing", {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      }),
    ).rejects.toMatchObject({ code: "work_not_found", status: 404 });
  });

  it("rejects hide on draft works (invalid_work_status_transition)", async () => {
    const deps = createAdminTestDeps({ works: [draftWork("w1")] });
    await expect(
      hideWork("w1", {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      }),
    ).rejects.toMatchObject({ code: "invalid_work_status_transition" });
  });

  it("rejects hide on already moderated work", async () => {
    const deps = createAdminTestDeps({ works: [moderatedWork("w1")] });
    await expect(
      hideWork("w1", {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      }),
    ).rejects.toMatchObject({ code: "invalid_work_status_transition" });
  });

  it("flips published → moderated, writes audit, increments counters", async () => {
    const deps = createAdminTestDeps({
      works: [publishedWork("w1")],
    });

    await hideWork("w1", {
      session: fakeAdminSession(ADMIN_EMAIL),
      adminEmails: ADMIN_EMAILS,
      ...deps,
    });

    const work = await deps.bundle.works.getById("w1");
    expect(work?.status).toBe("moderated");

    const audit = await deps.bundle.audit.listLatest(10);
    expect(audit[0]).toMatchObject({
      action: "work_moderation.hide",
      targetKind: "work",
      targetId: "w1",
      actorEmail: ADMIN_EMAIL,
    });

    const snap = deps.metrics.snapshot();
    expect(snap.admin.work_moderation.hidden).toBe(1);
    expect(snap.admin.audit.appended).toBe(1);
  });

  it("does not write audit when business write throws (tx atomicity)", async () => {
    const deps = createAdminTestDeps({ works: [publishedWork("w1")] });
    deps.bundle.works.save = vi.fn().mockRejectedValueOnce(new Error("boom"));

    await expect(
      hideWork("w1", {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      }),
    ).rejects.toThrow();

    expect((await deps.bundle.audit.listLatest(10)).length).toBe(0);
    expect(deps.metrics.snapshot().admin.work_moderation.hidden).toBe(0);
  });
});

describe("admin/work-moderation-actions > restoreWork", () => {
  it("rejects restore on published work", async () => {
    const deps = createAdminTestDeps({ works: [publishedWork("w1")] });
    await expect(
      restoreWork("w1", {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      }),
    ).rejects.toMatchObject({ code: "invalid_work_status_transition" });
  });

  it("rejects restore on draft work", async () => {
    const deps = createAdminTestDeps({ works: [draftWork("w1")] });
    await expect(
      restoreWork("w1", {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      }),
    ).rejects.toMatchObject({ code: "invalid_work_status_transition" });
  });

  it("flips moderated → published, writes audit, increments counters", async () => {
    const deps = createAdminTestDeps({
      works: [moderatedWork("w1")],
    });

    await restoreWork("w1", {
      session: fakeAdminSession(ADMIN_EMAIL),
      adminEmails: ADMIN_EMAILS,
      ...deps,
    });

    const work = await deps.bundle.works.getById("w1");
    expect(work?.status).toBe("published");

    const audit = await deps.bundle.audit.listLatest(10);
    expect(audit[0]).toMatchObject({
      action: "work_moderation.restore",
      targetKind: "work",
      targetId: "w1",
    });

    const snap = deps.metrics.snapshot();
    expect(snap.admin.work_moderation.restored).toBe(1);
    expect(snap.admin.audit.appended).toBe(1);
  });

  it("preserves existing publishedAt when restoring", async () => {
    const deps = createAdminTestDeps({
      works: [
        {
          ...moderatedWork("w1"),
          publishedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
    });

    await restoreWork("w1", {
      session: fakeAdminSession(ADMIN_EMAIL),
      adminEmails: ADMIN_EMAILS,
      ...deps,
    });

    const work = await deps.bundle.works.getById("w1");
    expect(work?.publishedAt).toBe("2024-01-01T00:00:00.000Z");
    expect(work?.status).toBe("published");
  });
});
