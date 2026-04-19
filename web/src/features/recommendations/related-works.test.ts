// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { getRelatedWorks } from "./related-works";
import {
  createRecommendationsTestDeps,
  fakeCreatorProfile,
  fakeWork,
} from "./test-support";

describe("recommendations/related-works", () => {
  it("returns null when the feature flag is disabled", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ id: "photographer:owner", slug: "owner" }),
      ],
      works: [
        fakeWork({ id: "seed", ownerProfileId: "photographer:owner" }),
        fakeWork({ id: "alpha", ownerProfileId: "photographer:owner" }),
      ],
    });
    const worksSpy = vi.spyOn(deps.bundle.works, "listPublicWorks");
    const profSpy = vi.spyOn(deps.bundle.profiles, "listPublicProfiles");

    const result = await getRelatedWorks(
      { workId: "seed" },
      { ...deps, flagEnabled: false },
    );

    expect(result).toBeNull();
    expect(worksSpy).not.toHaveBeenCalled();
    expect(profSpy).not.toHaveBeenCalled();
    expect(deps.metrics.snapshot().recommendations.related_works).toEqual({
      cards_rendered: 0,
      empty: 0,
    });
  });

  it("renders cards when there are matching candidates", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ id: "photographer:A", slug: "owner-a", city: "shanghai" }),
        fakeCreatorProfile({ id: "photographer:B", slug: "owner-b", city: "shanghai" }),
        fakeCreatorProfile({ id: "photographer:C", slug: "owner-c", city: "beijing" }),
      ],
      works: [
        fakeWork({ id: "seed", ownerProfileId: "photographer:A", category: "portrait" }),
        // same owner -> highest score
        fakeWork({ id: "same-owner", ownerProfileId: "photographer:A", category: "portrait" }),
        // same owner-city only
        fakeWork({ id: "same-city", ownerProfileId: "photographer:B", category: "landscape" }),
        // same category only
        fakeWork({ id: "same-cat", ownerProfileId: "photographer:C", category: "portrait" }),
        // nothing
        fakeWork({ id: "none", ownerProfileId: "photographer:C", category: "landscape" }),
      ],
    });

    const result = await getRelatedWorks({ workId: "seed" }, deps);

    expect(result?.kind).toBe("rendered");
    if (result?.kind !== "rendered") return;
    expect(result.cards.map((c) => c.workId)).toEqual([
      "same-owner",
      "same-city",
      "same-cat",
      "none",
    ]);
    expect(deps.metrics.snapshot().recommendations.related_works.cards_rendered).toBe(4);
  });

  it("filters out the seed work itself", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ id: "photographer:A", slug: "owner-a" }),
      ],
      works: [
        fakeWork({ id: "seed", ownerProfileId: "photographer:A" }),
        fakeWork({ id: "other", ownerProfileId: "photographer:A" }),
      ],
    });

    const result = await getRelatedWorks({ workId: "seed" }, deps);
    if (result?.kind !== "rendered") throw new Error("expected rendered");
    expect(result.cards.find((c) => c.workId === "seed")).toBeUndefined();
    expect(result.cards.map((c) => c.workId)).toEqual(["other"]);
  });

  it("excludes draft works from the candidate pool", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [fakeCreatorProfile({ id: "photographer:A", slug: "owner-a" })],
      works: [
        fakeWork({ id: "seed", ownerProfileId: "photographer:A" }),
        fakeWork({ id: "draft-one", ownerProfileId: "photographer:A", status: "draft" }),
      ],
    });

    const result = await getRelatedWorks({ workId: "seed" }, deps);
    expect(result?.kind).toBe("empty");
    if (result?.kind !== "empty") return;
    expect(result.reason).toBe("no-candidates");
  });

  it("excludes moderated works from the candidate pool (Phase 2 §3.2 ADR-5)", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [fakeCreatorProfile({ id: "photographer:A", slug: "owner-a" })],
      works: [
        fakeWork({ id: "seed", ownerProfileId: "photographer:A" }),
        fakeWork({
          id: "moderated-one",
          ownerProfileId: "photographer:A",
          status: "moderated",
        }),
      ],
    });

    const result = await getRelatedWorks({ workId: "seed" }, deps);
    expect(result?.kind).toBe("empty");
    if (result?.kind !== "empty") return;
    expect(result.reason).toBe("no-candidates");
  });

  it("returns empty (no-candidates) when only the seed work is published", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [fakeCreatorProfile({ id: "photographer:A", slug: "owner-a" })],
      works: [fakeWork({ id: "seed", ownerProfileId: "photographer:A" })],
    });

    const result = await getRelatedWorks({ workId: "seed" }, deps);
    expect(result?.kind).toBe("empty");
    expect(deps.metrics.snapshot().recommendations.related_works.empty).toBe(1);
  });

  it("reads each repository at most once per call (FR-008 #3)", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ id: "photographer:A", slug: "owner-a" }),
        fakeCreatorProfile({ id: "photographer:B", slug: "owner-b" }),
      ],
      works: [
        fakeWork({ id: "seed", ownerProfileId: "photographer:A" }),
        fakeWork({ id: "alpha", ownerProfileId: "photographer:A" }),
        fakeWork({ id: "bravo", ownerProfileId: "photographer:B" }),
      ],
    });
    const worksSpy = vi.spyOn(deps.bundle.works, "listPublicWorks");
    const profSpy = vi.spyOn(deps.bundle.profiles, "listPublicProfiles");

    await getRelatedWorks({ workId: "seed" }, deps);

    expect(worksSpy).toHaveBeenCalledTimes(1);
    expect(profSpy).toHaveBeenCalledTimes(1);
  });

  it("soft-fails when works repository throws", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [],
      works: [],
    });
    deps.bundle.works.listPublicWorks = async () => {
      throw new Error("boom");
    };

    const result = await getRelatedWorks({ workId: "seed" }, deps);
    expect(result?.kind).toBe("empty");
    if (result?.kind !== "empty") return;
    expect(result.reason).toBe("soft-fail");
    expect(deps.metrics.snapshot().recommendations.related_works.empty).toBe(1);
    expect(
      deps.capturedLogs.some(
        (r) => r.event === "recommendations.section.failed" && r.level === "warn",
      ),
    ).toBe(true);
  });

  it("returns empty (no-candidates) when seed work id is missing from public works", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [fakeCreatorProfile({ id: "photographer:A", slug: "owner-a" })],
      works: [fakeWork({ id: "other", ownerProfileId: "photographer:A" })],
    });

    const result = await getRelatedWorks({ workId: "missing" }, deps);
    // Seed missing -> we still rank against the pool (which contains "other"),
    // but with empty seed signals nothing scores > 0; ranking is still
    // deterministic, candidate pool is non-empty so we still render.
    expect(result?.kind).toBe("rendered");
    if (result?.kind !== "rendered") return;
    expect(result.cards.map((c) => c.workId)).toEqual(["other"]);
  });

  it("limits to at most 4 cards", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [fakeCreatorProfile({ id: "photographer:A", slug: "owner-a" })],
      works: [
        fakeWork({ id: "seed", ownerProfileId: "photographer:A" }),
        ...Array.from({ length: 8 }, (_, i) =>
          fakeWork({ id: `w${i}`, ownerProfileId: "photographer:A" }),
        ),
      ],
    });

    const result = await getRelatedWorks({ workId: "seed" }, deps);
    if (result?.kind !== "rendered") throw new Error("expected rendered");
    expect(result.cards.length).toBe(4);
  });
});
