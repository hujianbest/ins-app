// @vitest-environment node
//
// Phase 2 — Threaded Messaging V1 (NFR-001 micro-bench).
//
// Run with: RUN_PERF=1 npx vitest run src/features/messaging/perf.bench.test.ts
import { describe, expect, it } from "vitest";

import { createInMemoryCommunityRepositoryBundle } from "@/features/community/test-support";
import type {
  CommunityWorkRecord,
  DiscoveryEventRecord,
  WorkCommentRecord,
} from "@/features/community/types";
import { createMetricsRegistry } from "@/features/observability/metrics";

import { listInboxThreadsForAccount } from "./inbox-model";
import { listSystemNotificationsForAccount } from "./system-notifications";

const RUN_PERF = process.env.RUN_PERF === "1";
const describePerf = RUN_PERF ? describe : describe.skip;

describePerf("messaging perf micro-bench (NFR-001 P95 ≤ 120ms)", () => {
  it("listThreadsForAccount under 500 threads + 200 messages: P95 ≤ 120ms", async () => {
    const A = "photographer:bench-owner";
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
    });

    const counterparts: string[] = [];
    for (let i = 0; i < 500; i++) {
      counterparts.push(`model:counterpart-${i}`);
      const t = await bundle.messaging.threads.createDirectThread({
        initiatorAccountId: A,
        recipientAccountId: counterparts[i],
        contextRef: i % 3 === 0 ? `work:w${i}` : undefined,
      });
      if (i < 200) {
        await bundle.messaging.messages.appendMessage({
          threadId: t.id,
          authorAccountId: counterparts[i],
          body: `msg ${i}`,
        });
        await bundle.messaging.threads.updateLastMessageAt(
          t.id,
          new Date(2026, 0, 1, 0, i % 60).toISOString(),
        );
      }
    }

    const samples: number[] = [];
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      await listInboxThreadsForAccount(A, 100, bundle);
      samples.push(performance.now() - start);
    }
    samples.sort((a, b) => a - b);
    const p95 = samples[Math.floor(samples.length * 0.95)];
    console.log(`listThreadsForAccount P95: ${p95.toFixed(2)}ms`);
    expect(p95).toBeLessThan(120);
  });

  it("listSystemNotificationsForAccount under 500 events + 200 comments: P95 ≤ 120ms", async () => {
    const A = "photographer:bench-owner";
    const works: CommunityWorkRecord[] = Array.from({ length: 50 }, (_, i) => ({
      id: `w-${i}`,
      ownerProfileId: A,
      ownerRole: "photographer",
      ownerSlug: "bench-owner",
      ownerName: "Bench",
      status: "published",
      title: `Work ${i}`,
      category: "portrait",
      description: "",
      detailNote: "",
      coverAsset: "",
      publishedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }));
    const comments: WorkCommentRecord[] = Array.from(
      { length: 200 },
      (_, i) => ({
        id: `c-${i}`,
        workId: `w-${i % 50}`,
        authorAccountId: `account:fan-${i}`,
        body: "nice",
        createdAt: new Date(2026, 0, 1, 0, i % 60).toISOString(),
      }),
    );
    const events: DiscoveryEventRecord[] = Array.from(
      { length: 500 },
      (_, i) => ({
        id: `e-${i}`,
        eventType: i % 2 === 0 ? "follow" : "external_handoff_click",
        actorAccountId: `account:fan-${i}`,
        targetType: "profile",
        targetId: A,
        targetProfileId: A,
        surface: "profile_page",
        query: "",
        success: true,
        createdAt: new Date(2026, 0, 1, 0, i % 60).toISOString(),
      }),
    );

    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works,
      comments,
      discoveryEvents: events,
    });
    const metrics = createMetricsRegistry();

    const samples: number[] = [];
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      await listSystemNotificationsForAccount(A, 50, bundle, metrics);
      samples.push(performance.now() - start);
    }
    samples.sort((a, b) => a - b);
    const p95 = samples[Math.floor(samples.length * 0.95)];
    console.log(`listSystemNotificationsForAccount P95: ${p95.toFixed(2)}ms`);
    expect(p95).toBeLessThan(120);
  });
});
