// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createInMemoryCommunityRepositoryBundle } from "@/features/community/test-support";

import { listInboxThreadsForAccount } from "./inbox-model";

const A = "photographer:alice";
const B = "model:bob";

describe("messaging/inbox-model > listInboxThreadsForAccount", () => {
  it("returns empty array when account has no threads", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
    });
    const result = await listInboxThreadsForAccount(A, 100, bundle);
    expect(result).toEqual([]);
  });

  it("delegates to bundle.messaging.threads.listThreadsForAccount", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
    });
    await bundle.messaging.threads.createDirectThread({
      initiatorAccountId: A,
      recipientAccountId: B,
      contextRef: "work:w1",
    });
    const result = await listInboxThreadsForAccount(A, 100, bundle);
    expect(result.length).toBe(1);
    expect(result[0].counterpartAccountId).toBe(B);
  });
});
