// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  rankCandidates,
  scoreCreator,
  scoreWork,
} from "./scoring";
import {
  RELATED_CREATORS_WEIGHTS,
  RELATED_WORKS_WEIGHTS,
} from "./signals";
import type { CreatorSignals, WorkSignals } from "./types";

function creator(
  overrides: Partial<CreatorSignals> & { slug: string },
): CreatorSignals {
  const { slug, ...rest } = overrides;
  return {
    targetKey: `photographer:${slug}`,
    role: "photographer",
    slug,
    city: "shanghai",
    shootingFocus: "portrait",
    updatedAt: "2026-04-19T00:00:00.000Z",
    ...rest,
  };
}

function work(overrides: Partial<WorkSignals> & { workId: string }): WorkSignals {
  const { workId, ...rest } = overrides;
  return {
    targetKey: workId,
    workId,
    ownerProfileId: "profile-A",
    ownerCity: "shanghai",
    ownerShootingFocus: "portrait",
    category: "portrait",
    updatedAt: "2026-04-19T00:00:00.000Z",
    ...rest,
  };
}

describe("scoring/scoreCreator", () => {
  const seed = creator({ slug: "seed", city: "shanghai", shootingFocus: "portrait" });

  it("scores in [0, 1]", () => {
    const cases = [
      creator({ slug: "a", city: "shanghai", shootingFocus: "portrait" }),
      creator({ slug: "b", city: "beijing", shootingFocus: "landscape" }),
      creator({ slug: "c", city: "", shootingFocus: "" }),
    ];
    for (const c of cases) {
      const r = scoreCreator(seed, c);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it("strict ordering: same city + focus > same city only > same focus only > nothing", () => {
    const sameBoth = scoreCreator(
      seed,
      creator({ slug: "a", city: "shanghai", shootingFocus: "portrait" }),
    ).score;
    const sameCity = scoreCreator(
      seed,
      creator({ slug: "b", city: "shanghai", shootingFocus: "landscape" }),
    ).score;
    const sameFocus = scoreCreator(
      seed,
      creator({ slug: "c", city: "beijing", shootingFocus: "portrait" }),
    ).score;
    const nothing = scoreCreator(
      seed,
      creator({ slug: "d", city: "beijing", shootingFocus: "landscape" }),
    ).score;

    expect(sameBoth).toBeGreaterThan(sameCity);
    expect(sameCity).toBeGreaterThan(sameFocus);
    expect(sameFocus).toBeGreaterThan(nothing);
    expect(nothing).toBe(0);
  });

  it("missing fields contribute 0 (not NaN)", () => {
    const r = scoreCreator(
      seed,
      creator({ slug: "x", city: "", shootingFocus: "" }),
    );
    expect(r.score).toBe(0);
    expect(Number.isNaN(r.score)).toBe(false);
  });

  it("explicit zero weight contributes 0", () => {
    const r = scoreCreator(
      seed,
      creator({ slug: "y", city: "shanghai", shootingFocus: "portrait" }),
      { city: 0, shootingFocus: 0.4 },
    );
    expect(r.breakdown.city).toBe(0);
    expect(r.breakdown.shootingFocus).toBe(0.4);
    expect(r.score).toBe(0.4);
  });

  it("is deterministic / idempotent", () => {
    const c = creator({ slug: "z", city: "shanghai", shootingFocus: "landscape" });
    const a = scoreCreator(seed, c);
    const b = scoreCreator(seed, c);
    expect(a).toEqual(b);
  });

  it("does not throw on seed === candidate", () => {
    expect(() => scoreCreator(seed, seed)).not.toThrow();
  });

  it("breakdown sums to score", () => {
    const r = scoreCreator(
      seed,
      creator({ slug: "a", city: "shanghai", shootingFocus: "portrait" }),
    );
    const sum = Object.values(r.breakdown).reduce((acc, v) => acc + v, 0);
    expect(sum).toBeCloseTo(r.score, 9);
  });
});

describe("scoring/scoreWork", () => {
  const seed = work({ workId: "seed", ownerProfileId: "A", ownerCity: "shanghai", category: "portrait" });

  it("scores in [0, 1]", () => {
    const r = scoreWork(seed, work({ workId: "x", ownerProfileId: "A" }));
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(1);
  });

  it("strict ordering: same owner > same owner-city only > same category only > nothing", () => {
    const sameOwner = scoreWork(
      seed,
      work({
        workId: "a",
        ownerProfileId: "A",
        ownerCity: "shanghai",
        category: "portrait",
      }),
    ).score;
    const sameCityOnly = scoreWork(
      seed,
      work({
        workId: "b",
        ownerProfileId: "B",
        ownerCity: "shanghai",
        category: "landscape",
      }),
    ).score;
    const sameCategoryOnly = scoreWork(
      seed,
      work({
        workId: "c",
        ownerProfileId: "C",
        ownerCity: "beijing",
        category: "portrait",
      }),
    ).score;
    const nothing = scoreWork(
      seed,
      work({
        workId: "d",
        ownerProfileId: "D",
        ownerCity: "beijing",
        category: "landscape",
      }),
    ).score;

    expect(sameOwner).toBeGreaterThan(sameCityOnly);
    expect(sameCityOnly).toBeGreaterThan(sameCategoryOnly);
    expect(sameCategoryOnly).toBeGreaterThan(nothing);
    expect(nothing).toBe(0);
  });

  it("is deterministic", () => {
    const c = work({ workId: "y", ownerProfileId: "Z" });
    expect(scoreWork(seed, c)).toEqual(scoreWork(seed, c));
  });
});

describe("scoring/rankCandidates", () => {
  const seed = creator({ slug: "seed" });

  it("returns at most `limit` items", () => {
    const cands = Array.from({ length: 10 }, (_, i) =>
      creator({ slug: `c${i}`, city: i % 2 === 0 ? "shanghai" : "beijing" }),
    );
    const out = rankCandidates(seed, cands, scoreCreator, { limit: 4 });
    expect(out.length).toBe(4);
  });

  it("returns all when fewer than limit", () => {
    const cands = [
      creator({ slug: "a" }),
      creator({ slug: "b", city: "beijing" }),
    ];
    const out = rankCandidates(seed, cands, scoreCreator, { limit: 4 });
    expect(out.length).toBe(2);
  });

  it("sorts by score desc", () => {
    const cands = [
      creator({ slug: "low", city: "beijing", shootingFocus: "landscape" }),
      creator({ slug: "high", city: "shanghai", shootingFocus: "portrait" }),
      creator({ slug: "mid", city: "shanghai", shootingFocus: "landscape" }),
    ];
    const out = rankCandidates(seed, cands, scoreCreator, { limit: 4 });
    const slugs = out.map((r) => r.candidate.slug);
    expect(slugs).toEqual(["high", "mid", "low"]);
  });

  it("uses updatedAt desc as first tie-breaker", () => {
    const cands = [
      creator({
        slug: "older",
        city: "shanghai",
        shootingFocus: "portrait",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
      creator({
        slug: "newer",
        city: "shanghai",
        shootingFocus: "portrait",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    ];
    const out = rankCandidates(seed, cands, scoreCreator);
    expect(out.map((r) => r.candidate.slug)).toEqual(["newer", "older"]);
  });

  it("uses targetKey asc as final tie-breaker", () => {
    const cands = [
      creator({
        slug: "zzz",
        city: "shanghai",
        shootingFocus: "portrait",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
      creator({
        slug: "aaa",
        city: "shanghai",
        shootingFocus: "portrait",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    ];
    const out = rankCandidates(seed, cands, scoreCreator);
    expect(out.map((r) => r.candidate.slug)).toEqual(["aaa", "zzz"]);
  });

  it("filters out self via isSelf", () => {
    const cands = [
      creator({ slug: "seed" }),
      creator({ slug: "other", city: "beijing" }),
    ];
    const out = rankCandidates(seed, cands, scoreCreator, {
      isSelf: (c) => c.targetKey === seed.targetKey,
    });
    expect(out.map((r) => r.candidate.slug)).toEqual(["other"]);
  });

  it("is deterministic on same input", () => {
    const cands = Array.from({ length: 6 }, (_, i) =>
      creator({ slug: `c${i}`, city: i % 2 ? "shanghai" : "beijing" }),
    );
    const a = rankCandidates(seed, cands, scoreCreator);
    const b = rankCandidates(seed, cands, scoreCreator);
    expect(a).toEqual(b);
  });
});

describe("scoring works with default weights satisfying SRS §8.3", () => {
  it("RELATED_CREATORS_WEIGHTS yields city contribution >= focus contribution", () => {
    expect(RELATED_CREATORS_WEIGHTS.city).toBeGreaterThanOrEqual(
      RELATED_CREATORS_WEIGHTS.shootingFocus,
    );
  });

  it("RELATED_WORKS_WEIGHTS sameOwner > ownerCity >= category", () => {
    expect(RELATED_WORKS_WEIGHTS.sameOwner).toBeGreaterThan(
      RELATED_WORKS_WEIGHTS.ownerCity,
    );
    expect(RELATED_WORKS_WEIGHTS.ownerCity).toBeGreaterThanOrEqual(
      RELATED_WORKS_WEIGHTS.category,
    );
  });
});
