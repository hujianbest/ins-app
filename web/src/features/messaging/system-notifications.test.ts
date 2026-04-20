// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  type CommunityWorkRecord,
  type DiscoveryEventRecord,
  type WorkCommentRecord,
} from "@/features/community/types";
import { createInMemoryCommunityRepositoryBundle } from "@/features/community/test-support";
import { createMetricsRegistry } from "@/features/observability/metrics";

import { listSystemNotificationsForAccount } from "./system-notifications";

const PHOTOGRAPHER_ID = "photographer:sample-photographer";
const FOLLOWER_ACCOUNT = "account:follower:photographer";

function makeFollowEvent(actor: string, targetProfileId: string, createdAt: string): DiscoveryEventRecord {
  return {
    id: `e-follow-${createdAt}`,
    eventType: "follow",
    actorAccountId: actor,
    targetType: "profile",
    targetId: targetProfileId,
    targetProfileId,
    surface: "profile_page",
    query: "",
    success: true,
    createdAt,
  };
}

function makeHandoffEvent(actor: string, targetProfileId: string, createdAt: string): DiscoveryEventRecord {
  return {
    id: `e-handoff-${createdAt}`,
    eventType: "external_handoff_click",
    actorAccountId: actor,
    targetType: "profile",
    targetId: targetProfileId,
    targetProfileId,
    surface: "profile_page",
    query: "",
    success: true,
    createdAt,
  };
}

function makeWork(id: string, ownerProfileId: string): CommunityWorkRecord {
  return {
    id,
    ownerProfileId,
    ownerRole: "photographer",
    ownerSlug: "sample-photographer",
    ownerName: "Sample Photographer",
    status: "published",
    title: `Work ${id}`,
    category: "portrait",
    description: "",
    detailNote: "",
    coverAsset: "",
    publishedAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
  };
}

function makeComment(id: string, workId: string, author: string, createdAt: string): WorkCommentRecord {
  return {
    id,
    workId,
    authorAccountId: author,
    body: "looks great",
    createdAt,
  };
}

describe("messaging/system-notifications > listSystemNotificationsForAccount", () => {
  it("returns empty list when no events / comments", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
    });
    const result = await listSystemNotificationsForAccount(PHOTOGRAPHER_ID, 50, bundle);
    expect(result).toEqual([]);
  });

  it("aggregates follow + external_handoff + comment notifications and orders by createdAt desc", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [makeWork("w1", PHOTOGRAPHER_ID)],
      comments: [
        makeComment("c1", "w1", FOLLOWER_ACCOUNT, "2026-04-19T03:00:00.000Z"),
        makeComment(
          "c2",
          "w1",
          PHOTOGRAPHER_ID, // self comment — must be excluded
          "2026-04-19T03:30:00.000Z",
        ),
      ],
      discoveryEvents: [
        makeFollowEvent(FOLLOWER_ACCOUNT, PHOTOGRAPHER_ID, "2026-04-19T01:00:00.000Z"),
        makeHandoffEvent(FOLLOWER_ACCOUNT, PHOTOGRAPHER_ID, "2026-04-19T02:00:00.000Z"),
        // Event targeting another profile — must be excluded
        makeFollowEvent(FOLLOWER_ACCOUNT, "model:other", "2026-04-19T04:00:00.000Z"),
      ],
    });
    const result = await listSystemNotificationsForAccount(PHOTOGRAPHER_ID, 50, bundle);
    expect(result.length).toBe(3);
    // newest first: c1 (3:00) > handoff (2:00) > follow (1:00)
    expect(result[0].kind).toBe("comment");
    expect(result[0].id).toBe("comment:c1");
    expect(result[1].kind).toBe("external_handoff");
    expect(result[2].kind).toBe("follow");
    // c2 (self) must NOT appear
    expect(result.some((r) => r.id === "comment:c2")).toBe(false);
  });

  it("respects the limit parameter", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [makeWork("w1", PHOTOGRAPHER_ID)],
      discoveryEvents: Array.from({ length: 60 }, (_, i) =>
        makeFollowEvent(
          FOLLOWER_ACCOUNT,
          PHOTOGRAPHER_ID,
          `2026-04-19T0${(i % 9) + 1}:00:0${i % 10}.000Z`,
        ),
      ),
    });
    const result = await listSystemNotificationsForAccount(PHOTOGRAPHER_ID, 50, bundle);
    expect(result.length).toBe(50);
  });

  it("increments messaging.system_notifications_listed counter when metrics is passed", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
    });
    const metrics = createMetricsRegistry();
    await listSystemNotificationsForAccount(PHOTOGRAPHER_ID, 50, bundle, metrics);
    await listSystemNotificationsForAccount(PHOTOGRAPHER_ID, 50, bundle, metrics);
    expect(metrics.snapshot().messaging.system_notifications_listed).toBe(2);
  });

  it("does NOT increment counter when metrics is not provided", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
    });
    const metrics = createMetricsRegistry();
    await listSystemNotificationsForAccount(PHOTOGRAPHER_ID, 50, bundle);
    expect(metrics.snapshot().messaging.system_notifications_listed).toBe(0);
  });
});
