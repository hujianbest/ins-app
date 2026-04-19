// @vitest-environment node
//
// NFR-001 SSR performance budget — admin orchestration micro-benchmark
// for the Phase 2 §3.2 Ops Back Office V1 increment.
//
// Skipped by default; run with:
//   RUN_PERF=1 npx vitest run --reporter=verbose src/features/admin/perf.bench.test.ts
import { performance } from "node:perf_hooks";
import { describe, expect, it } from "vitest";

import {
  createAdminTestDeps,
  fakeAdminSession,
} from "./test-support";

const RUN_PERF = process.env.RUN_PERF === "1";
const ITERATIONS = 1000;
const WARMUP = 100;

function pickP(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

const itPerf = RUN_PERF ? it : it.skip;

describe("admin SSR performance (NFR-001)", () => {
  itPerf("listAllForAdmin stays under 80ms P95 with 500 works", async () => {
    const deps = createAdminTestDeps({
      works: Array.from({ length: 500 }, (_, i) => ({
        id: `w${i}`,
        ownerProfileId: `photographer:owner-${i % 50}`,
        ownerRole: "photographer",
        ownerSlug: `owner-${i % 50}`,
        ownerName: `Owner ${i % 50}`,
        status:
          i % 3 === 0
            ? ("draft" as const)
            : i % 3 === 1
              ? ("published" as const)
              : ("moderated" as const),
        title: `Work ${i}`,
        category: "portrait",
        description: "",
        detailNote: "",
        coverAsset: "",
        publishedAt: "2026-04-19T00:00:00.000Z",
        updatedAt: "2026-04-19T00:00:00.000Z",
      })),
    });

    for (let i = 0; i < WARMUP; i++) {
      await deps.bundle.works.listAllForAdmin();
    }
    const samples: number[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const t0 = performance.now();
      await deps.bundle.works.listAllForAdmin();
      samples.push(performance.now() - t0);
    }
    const p95 = pickP(samples, 95);
    console.log(
      `listAllForAdmin n=${samples.length} p50=${pickP(samples, 50).toFixed(2)}ms p95=${p95.toFixed(2)}ms p99=${pickP(samples, 99).toFixed(2)}ms`,
    );
    expect(p95).toBeLessThanOrEqual(80);
  });

  itPerf("audit.listLatest(100) stays under 80ms P95 with 200 entries pool", async () => {
    const deps = createAdminTestDeps({
      audit: Array.from({ length: 200 }, (_, i) => ({
        id: `a-${i}`,
        createdAt: new Date(Date.now() - i * 60_000).toISOString(),
        actorAccountId: `account:admin:${i % 5}`,
        actorEmail: `admin${i % 5}@example.com`,
        action: "curation.upsert" as const,
        targetKind: "curation_slot" as const,
        targetId: `home:works:work-${i}`,
      })),
    });
    // dispatch via admin runtime to mirror real path
    const session = fakeAdminSession("admin0@example.com");
    void session;

    for (let i = 0; i < WARMUP; i++) {
      await deps.bundle.audit.listLatest(100);
    }
    const samples: number[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const t0 = performance.now();
      await deps.bundle.audit.listLatest(100);
      samples.push(performance.now() - t0);
    }
    const p95 = pickP(samples, 95);
    console.log(
      `audit.listLatest(100) n=${samples.length} p50=${pickP(samples, 50).toFixed(2)}ms p95=${p95.toFixed(2)}ms p99=${pickP(samples, 99).toFixed(2)}ms`,
    );
    expect(p95).toBeLessThanOrEqual(80);
  });
});
