// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createInMemoryCommunityRepositoryBundle } from "./test-support";

describe("createInMemoryCommunityRepositoryBundle (R-1: messaging auto-empty for legacy callers)", () => {
  it("auto-initializes empty messaging arrays when fixtures omit messaging", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
      curation: [],
    });

    await expect(
      bundle.messaging.threads.listThreadsForAccount("photographer:any", 100),
    ).resolves.toEqual([]);
    await expect(
      bundle.messaging.messages.listByThreadId("nonexistent", 10),
    ).resolves.toEqual([]);
    await expect(
      bundle.messaging.participants.listForThread("nonexistent"),
    ).resolves.toEqual([]);
    await expect(
      bundle.messaging.participants.getUnreadCountForAccount("photographer:any"),
    ).resolves.toBe(0);
  });

  it("supports the unordered pair dedupe contract on in-memory bundle", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
      curation: [],
    });

    const A = "photographer:alice";
    const B = "model:bob";

    const t = await bundle.messaging.threads.createDirectThread({
      initiatorAccountId: A,
      recipientAccountId: B,
      contextRef: "work:w1",
    });

    const fwd = await bundle.messaging.threads.findDirectThreadByUnorderedPair(
      A,
      B,
      "work:w1",
    );
    const rev = await bundle.messaging.threads.findDirectThreadByUnorderedPair(
      B,
      A,
      "work:w1",
    );
    expect(fwd?.id).toBe(t.id);
    expect(rev?.id).toBe(t.id);

    const otherCtx = await bundle.messaging.threads.findDirectThreadByUnorderedPair(
      A,
      B,
      "work:w2",
    );
    expect(otherCtx).toBeNull();
  });

  it("listThreadsForAccount unread excludes self-authored messages on in-memory bundle", async () => {
    const bundle = createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
      curation: [],
    });
    const A = "photographer:alice";
    const B = "model:bob";
    const t = await bundle.messaging.threads.createDirectThread({
      initiatorAccountId: A,
      recipientAccountId: B,
    });
    await bundle.messaging.messages.appendMessage({
      threadId: t.id,
      authorAccountId: B,
      body: "x",
    });
    await bundle.messaging.messages.appendMessage({
      threadId: t.id,
      authorAccountId: A,
      body: "self",
    });

    const projections = await bundle.messaging.threads.listThreadsForAccount(A, 10);
    expect(projections.length).toBe(1);
    expect(projections[0].unreadCount).toBe(1);
    expect(projections[0].counterpartAccountId).toBe(B);
  });
});
