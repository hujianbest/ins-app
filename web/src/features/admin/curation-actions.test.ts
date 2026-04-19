// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import {
  removeCuratedSlot,
  reorderCuratedSlot,
  upsertCuratedSlot,
} from "./curation-actions";
import {
  createAdminTestDeps,
  fakeAdminSession,
  fakeNonAdminSession,
} from "./test-support";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_EMAILS = new Set([ADMIN_EMAIL]);

function fd(record: Record<string, string>): FormData {
  const form = new FormData();
  for (const [k, v] of Object.entries(record)) form.set(k, v);
  return form;
}

describe("admin/curation-actions > upsertCuratedSlot", () => {
  it("rejects non-admin callers (forbidden_admin_only)", async () => {
    const deps = createAdminTestDeps();
    await expect(
      upsertCuratedSlot(
        fd({
          surface: "home",
          sectionKind: "works",
          targetType: "work",
          targetKey: "work-x",
          order: "1",
        }),
        {
          session: fakeNonAdminSession("u@example.com"),
          adminEmails: ADMIN_EMAILS,
          ...deps,
        },
      ),
    ).rejects.toMatchObject({ code: "forbidden_admin_only" });
  });

  it("rejects invalid surface / sectionKind / targetType (invalid_curation_input)", async () => {
    const deps = createAdminTestDeps();
    await expect(
      upsertCuratedSlot(
        fd({
          surface: "invalid",
          sectionKind: "works",
          targetType: "work",
          targetKey: "work-x",
          order: "1",
        }),
        {
          session: fakeAdminSession(ADMIN_EMAIL),
          adminEmails: ADMIN_EMAILS,
          ...deps,
        },
      ),
    ).rejects.toMatchObject({ code: "invalid_curation_input" });
  });

  it("rejects non-integer order (invalid_curation_input)", async () => {
    const deps = createAdminTestDeps();
    await expect(
      upsertCuratedSlot(
        fd({
          surface: "home",
          sectionKind: "works",
          targetType: "work",
          targetKey: "work-x",
          order: "abc",
        }),
        {
          session: fakeAdminSession(ADMIN_EMAIL),
          adminEmails: ADMIN_EMAILS,
          ...deps,
        },
      ),
    ).rejects.toMatchObject({ code: "invalid_curation_input" });
  });

  it("inserts a new slot, writes audit, and increments admin.curation.added + admin.audit.appended", async () => {
    const deps = createAdminTestDeps({
      profiles: [],
      works: [
        {
          id: "work-x",
          ownerProfileId: "photographer:owner",
          ownerRole: "photographer",
          ownerSlug: "owner",
          ownerName: "Owner",
          status: "published",
          title: "Work",
          category: "portrait",
          description: "",
          detailNote: "",
          coverAsset: "",
          publishedAt: "2026-04-19T00:00:00.000Z",
          updatedAt: "2026-04-19T00:00:00.000Z",
        },
      ],
    });

    await upsertCuratedSlot(
      fd({
        surface: "home",
        sectionKind: "works",
        targetType: "work",
        targetKey: "work-x",
        order: "1",
      }),
      {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      },
    );

    const slots = await deps.bundle.curation.listSlotsBySurface("home");
    expect(slots).toEqual([
      {
        surface: "home",
        sectionKind: "works",
        targetType: "work",
        targetKey: "work-x",
        order: 1,
      },
    ]);

    const audit = await deps.bundle.audit.listLatest(10);
    expect(audit.length).toBe(1);
    expect(audit[0]).toMatchObject({
      action: "curation.upsert",
      targetKind: "curation_slot",
      targetId: "home:works:work-x",
      actorEmail: ADMIN_EMAIL,
    });

    const snap = deps.metrics.snapshot();
    expect(snap.admin.curation.added).toBe(1);
    expect(snap.admin.audit.appended).toBe(1);
  });

  it("notes target_not_found_at_write when targetKey points to missing target (still persists)", async () => {
    const deps = createAdminTestDeps({ profiles: [], works: [] });

    await upsertCuratedSlot(
      fd({
        surface: "home",
        sectionKind: "works",
        targetType: "work",
        targetKey: "missing-work",
        order: "1",
      }),
      {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      },
    );

    const slots = await deps.bundle.curation.listSlotsBySurface("home");
    expect(slots.length).toBe(1);

    const audit = await deps.bundle.audit.listLatest(10);
    expect(audit[0].note).toBe("target_not_found_at_write");
  });

  it("treats repeated upsert on same primary key as update (single audit per call)", async () => {
    const deps = createAdminTestDeps();

    for (const order of ["1", "5"]) {
      await upsertCuratedSlot(
        fd({
          surface: "home",
          sectionKind: "works",
          targetType: "work",
          targetKey: "work-x",
          order,
        }),
        {
          session: fakeAdminSession(ADMIN_EMAIL),
          adminEmails: ADMIN_EMAILS,
          ...deps,
        },
      );
    }

    const slots = await deps.bundle.curation.listSlotsBySurface("home");
    expect(slots.length).toBe(1);
    expect(slots[0].order).toBe(5);

    const audit = await deps.bundle.audit.listLatest(10);
    expect(audit.length).toBe(2);
    expect(deps.metrics.snapshot().admin.curation.added).toBe(2);
  });
});

describe("admin/curation-actions > removeCuratedSlot", () => {
  it("removes a slot + writes audit + counters", async () => {
    const deps = createAdminTestDeps({
      curation: [
        {
          surface: "home",
          sectionKind: "works",
          targetType: "work",
          targetKey: "work-y",
          order: 2,
        },
      ],
    });

    await removeCuratedSlot(
      fd({ surface: "home", sectionKind: "works", targetKey: "work-y" }),
      {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      },
    );

    const slots = await deps.bundle.curation.listSlotsBySurface("home");
    expect(slots).toEqual([]);

    const audit = await deps.bundle.audit.listLatest(10);
    expect(audit[0]).toMatchObject({
      action: "curation.remove",
      targetId: "home:works:work-y",
    });

    const snap = deps.metrics.snapshot();
    expect(snap.admin.curation.removed).toBe(1);
    expect(snap.admin.audit.appended).toBe(1);
  });
});

describe("admin/curation-actions > reorderCuratedSlot", () => {
  it("updates order + writes audit + counters", async () => {
    const deps = createAdminTestDeps({
      curation: [
        {
          surface: "home",
          sectionKind: "works",
          targetType: "work",
          targetKey: "work-z",
          order: 0,
        },
      ],
    });

    await reorderCuratedSlot(
      fd({
        surface: "home",
        sectionKind: "works",
        targetKey: "work-z",
        order: "9",
      }),
      {
        session: fakeAdminSession(ADMIN_EMAIL),
        adminEmails: ADMIN_EMAILS,
        ...deps,
      },
    );

    const slots = await deps.bundle.curation.listSlotsBySurface("home");
    expect(slots[0].order).toBe(9);

    const audit = await deps.bundle.audit.listLatest(10);
    expect(audit[0]).toMatchObject({
      action: "curation.reorder",
      targetId: "home:works:work-z",
    });

    const snap = deps.metrics.snapshot();
    expect(snap.admin.curation.reordered).toBe(1);
    expect(snap.admin.audit.appended).toBe(1);
  });

  it("rejects reorder for missing slot (invalid_curation_input)", async () => {
    const deps = createAdminTestDeps();
    await expect(
      reorderCuratedSlot(
        fd({
          surface: "home",
          sectionKind: "works",
          targetKey: "missing",
          order: "3",
        }),
        {
          session: fakeAdminSession(ADMIN_EMAIL),
          adminEmails: ADMIN_EMAILS,
          ...deps,
        },
      ),
    ).rejects.toMatchObject({ code: "invalid_curation_input" });
  });
});

describe("admin/curation-actions tx atomicity (sqlite-only invariant; in-memory falls back)", () => {
  it("does not write audit when business write throws", async () => {
    const deps = createAdminTestDeps({
      curation: [
        {
          surface: "home",
          sectionKind: "works",
          targetType: "work",
          targetKey: "work-tx",
          order: 1,
        },
      ],
    });
    const originalUpsert = deps.bundle.curation.upsertSlot;
    deps.bundle.curation.upsertSlot = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"));

    await expect(
      upsertCuratedSlot(
        fd({
          surface: "home",
          sectionKind: "works",
          targetType: "work",
          targetKey: "work-tx",
          order: "2",
        }),
        {
          session: fakeAdminSession(ADMIN_EMAIL),
          adminEmails: ADMIN_EMAILS,
          ...deps,
        },
      ),
    ).rejects.toThrow();

    deps.bundle.curation.upsertSlot = originalUpsert;
    expect((await deps.bundle.audit.listLatest(10)).length).toBe(0);
    // counter only increments after successful business write
    expect(deps.metrics.snapshot().admin.curation.added).toBe(0);
  });
});
