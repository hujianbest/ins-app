// @vitest-environment node
//
// NFR-001 / FR-008 SSR performance budget — orchestration-layer
// micro-benchmark for the Discovery Intelligence V1 increment.
//
// Skipped by default to keep CI deterministic; run with:
//   RUN_PERF=1 npx vitest run src/features/recommendations/perf.bench.test.ts
import { performance } from "node:perf_hooks";
import { describe, expect, it } from "vitest";

import { getRelatedCreators } from "./related-creators";
import { getRelatedWorks } from "./related-works";
import {
  createRecommendationsTestDeps,
  fakeCreatorProfile,
  fakeWork,
} from "./test-support";

const RUN_PERF = process.env.RUN_PERF === "1";
const ITERATIONS = 1000;
const WARMUP = 100;

const cities = ["shanghai", "beijing", "guangzhou", "shenzhen", "chengdu"];
const focuses = ["portrait", "landscape", "fashion", "wedding", "documentary"];

function pickP(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

const itPerf = RUN_PERF ? it : it.skip;

describe("recommendations performance (NFR-001 / FR-008)", () => {
  itPerf("getRelatedCreators stays under 30ms P95 with 100 same-role candidates", async () => {
    const profiles = Array.from({ length: 100 }, (_, i) =>
      fakeCreatorProfile({
        slug: `c${i}`,
        city: cities[i % cities.length],
        shootingFocus: focuses[i % focuses.length],
      }),
    );
    profiles.push(fakeCreatorProfile({ slug: "seed", city: cities[0], shootingFocus: focuses[0] }));
    const deps = createRecommendationsTestDeps({ profiles, works: [] });

    for (let i = 0; i < WARMUP; i++) {
      await getRelatedCreators({ role: "photographer", slug: "seed" }, deps);
    }
    const samples: number[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const t0 = performance.now();
      await getRelatedCreators({ role: "photographer", slug: "seed" }, deps);
      samples.push(performance.now() - t0);
    }
    const p95 = pickP(samples, 95);
    console.log(
      `getRelatedCreators  n=${samples.length}  p50=${pickP(samples, 50).toFixed(2)}ms  p95=${p95.toFixed(2)}ms  p99=${pickP(samples, 99).toFixed(2)}ms`,
    );
    expect(p95).toBeLessThanOrEqual(30);
  });

  itPerf("getRelatedWorks stays under 30ms P95 with 200 works + 50 owner profiles", async () => {
    const ownerProfiles = Array.from({ length: 50 }, (_, i) =>
      fakeCreatorProfile({
        slug: `owner${i}`,
        city: cities[i % cities.length],
        shootingFocus: focuses[i % focuses.length],
      }),
    );
    const works = Array.from({ length: 200 }, (_, i) =>
      fakeWork({
        id: `w${i}`,
        ownerProfileId: ownerProfiles[i % ownerProfiles.length].id,
        category: focuses[i % focuses.length],
      }),
    );
    works.push(fakeWork({ id: "seed-work", ownerProfileId: ownerProfiles[0].id, category: focuses[0] }));
    const deps = createRecommendationsTestDeps({
      profiles: ownerProfiles,
      works,
    });

    for (let i = 0; i < WARMUP; i++) {
      await getRelatedWorks({ workId: "seed-work" }, deps);
    }
    const samples: number[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const t0 = performance.now();
      await getRelatedWorks({ workId: "seed-work" }, deps);
      samples.push(performance.now() - t0);
    }
    const p95 = pickP(samples, 95);
    console.log(
      `getRelatedWorks  n=${samples.length}  p50=${pickP(samples, 50).toFixed(2)}ms  p95=${p95.toFixed(2)}ms  p99=${pickP(samples, 99).toFixed(2)}ms`,
    );
    expect(p95).toBeLessThanOrEqual(30);
  });
});
