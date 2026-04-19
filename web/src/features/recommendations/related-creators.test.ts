// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { getRelatedCreators } from "./related-creators";
import {
  createRecommendationsTestDeps,
  fakeCreatorProfile,
} from "./test-support";

const SEED = { role: "photographer" as const, slug: "seed" };

describe("recommendations/related-creators", () => {
  it("returns null when the feature flag is disabled", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed" }),
        fakeCreatorProfile({ slug: "alpha" }),
      ],
      works: [],
    });
    const listSpy = vi.spyOn(deps.bundle.profiles, "listPublicProfiles");

    const result = await getRelatedCreators(SEED, {
      ...deps,
      flagEnabled: false,
    });

    expect(result).toBeNull();
    expect(listSpy).not.toHaveBeenCalled();
    expect(deps.metrics.snapshot().recommendations.related_creators).toEqual({
      cards_rendered: 0,
      empty: 0,
    });
  });

  it("renders cards when there are matching same-role candidates", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed", city: "shanghai", shootingFocus: "portrait" }),
        fakeCreatorProfile({ slug: "alpha", city: "shanghai", shootingFocus: "portrait" }),
        fakeCreatorProfile({ slug: "bravo", city: "shanghai", shootingFocus: "landscape" }),
        fakeCreatorProfile({ slug: "charlie", city: "beijing", shootingFocus: "portrait" }),
        fakeCreatorProfile({ slug: "delta", city: "beijing", shootingFocus: "landscape" }),
      ],
      works: [],
    });

    const result = await getRelatedCreators(SEED, deps);

    expect(result?.kind).toBe("rendered");
    if (result?.kind !== "rendered") return;
    expect(result.cards.map((c) => c.slug)).toEqual([
      "alpha",
      "bravo",
      "charlie",
      "delta",
    ]);
    expect(deps.metrics.snapshot().recommendations.related_creators).toEqual({
      cards_rendered: 4,
      empty: 0,
    });
    expect(
      deps.capturedLogs.some(
        (r) => r.event === "recommendations.section.rendered" && r.level === "info",
      ),
    ).toBe(true);
  });

  it("filters out the seed creator from candidates", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed" }),
        fakeCreatorProfile({ slug: "alpha" }),
      ],
      works: [],
    });

    const result = await getRelatedCreators(SEED, deps);
    if (result?.kind !== "rendered") throw new Error("expected rendered");
    expect(result.cards.find((c) => c.slug === "seed")).toBeUndefined();
    expect(result.cards.map((c) => c.slug)).toEqual(["alpha"]);
  });

  it("only considers candidates with the same role as the seed", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed", role: "photographer" }),
        fakeCreatorProfile({
          id: "model:m1",
          slug: "m1",
          role: "model",
        }),
      ],
      works: [],
    });

    const result = await getRelatedCreators(SEED, deps);
    expect(result?.kind).toBe("empty");
    if (result?.kind !== "empty") return;
    expect(result.reason).toBe("no-candidates");
    expect(deps.metrics.snapshot().recommendations.related_creators).toEqual({
      cards_rendered: 0,
      empty: 1,
    });
  });

  it("returns empty (no-candidates) when only the seed is in the system", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [fakeCreatorProfile({ slug: "seed" })],
      works: [],
    });

    const result = await getRelatedCreators(SEED, deps);
    expect(result?.kind).toBe("empty");
    expect(deps.metrics.snapshot().recommendations.related_creators.empty).toBe(1);
  });

  it("reads the candidate pool only once per call (FR-008 #3)", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed" }),
        fakeCreatorProfile({ slug: "alpha" }),
        fakeCreatorProfile({ slug: "bravo" }),
      ],
      works: [],
    });
    const listSpy = vi.spyOn(deps.bundle.profiles, "listPublicProfiles");

    await getRelatedCreators(SEED, deps);

    expect(listSpy).toHaveBeenCalledTimes(1);
  });

  it("soft-fails when the repository throws", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [],
      works: [],
    });
    deps.bundle.profiles.listPublicProfiles = async () => {
      throw new Error("boom");
    };

    const result = await getRelatedCreators(SEED, deps);
    expect(result?.kind).toBe("empty");
    if (result?.kind !== "empty") return;
    expect(result.reason).toBe("soft-fail");
    expect(deps.metrics.snapshot().recommendations.related_creators.empty).toBe(1);
    expect(
      deps.capturedLogs.some(
        (r) => r.event === "recommendations.section.failed" && r.level === "warn",
      ),
    ).toBe(true);
  });

  it("uses publishedAt as updatedAt fallback for stable tie-breaker (I-12)", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed", city: "shanghai", shootingFocus: "portrait" }),
        // No updatedAt — should fall back to publishedAt
        fakeCreatorProfile({
          slug: "newer-published",
          city: "shanghai",
          shootingFocus: "portrait",
          publishedAt: "2026-04-19T00:00:00.000Z",
          updatedAt: undefined,
        }),
        fakeCreatorProfile({
          slug: "older-published",
          city: "shanghai",
          shootingFocus: "portrait",
          publishedAt: "2024-01-01T00:00:00.000Z",
          updatedAt: undefined,
        }),
      ],
      works: [],
    });

    const result = await getRelatedCreators(SEED, deps);
    if (result?.kind !== "rendered") throw new Error("expected rendered");
    // newer-published comes first because publishedAt desc tie-breaker is stable.
    expect(result.cards.map((c) => c.slug)).toEqual([
      "newer-published",
      "older-published",
    ]);
  });

  it("limits to at most 4 cards", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed" }),
        ...Array.from({ length: 8 }, (_, i) =>
          fakeCreatorProfile({ slug: `c${i}` }),
        ),
      ],
      works: [],
    });

    const result = await getRelatedCreators(SEED, deps);
    if (result?.kind !== "rendered") throw new Error("expected rendered");
    expect(result.cards.length).toBe(4);
  });
});
