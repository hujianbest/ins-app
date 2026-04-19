// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { createOrFindDirectThread } from "./thread-actions";
import {
  createCapturingLogger,
  createMessagingTestDeps,
  fakeGuestSession,
  fakePhotographerSession,
} from "./test-support";

import { loadInboxThreadView } from "./inbox-thread-view";

const PHOTOGRAPHER_ID = "photographer:sample-photographer";
const MODEL_ID = "model:sample-model";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("__notFound__");
  }),
}));

function bundleWithProfiles() {
  return createMessagingTestDeps({
    profiles: [
      {
        id: PHOTOGRAPHER_ID,
        role: "photographer",
        slug: "sample-photographer",
        name: "Sample Photographer",
        city: "shanghai",
        shootingFocus: "portrait",
        discoveryContext: "",
        externalHandoffUrl: "",
        tagline: "",
        bio: "",
        publishedAt: "2026-04-19T00:00:00.000Z",
      },
      {
        id: MODEL_ID,
        role: "model",
        slug: "sample-model",
        name: "Sample Model",
        city: "shanghai",
        shootingFocus: "portrait",
        discoveryContext: "",
        externalHandoffUrl: "",
        tagline: "",
        bio: "",
        publishedAt: "2026-04-19T00:00:00.000Z",
      },
    ],
  });
}

describe("messaging/inbox-thread-view > loadInboxThreadView", () => {
  it("redirects guest to /login (step 1)", async () => {
    const deps = bundleWithProfiles();
    await expect(
      loadInboxThreadView("any-thread", fakeGuestSession(), deps),
    ).rejects.toThrow("__redirect__:/login");
    // markRead must NOT have been called
    expect(
      deps.capturedLogs.some((r) => r.event === "messaging.action.completed"),
    ).toBe(false);
  });

  it("notFound on non-participant (step 2) — does NOT call markRead", async () => {
    const deps = bundleWithProfiles();
    const markReadSpy = vi.spyOn(deps.bundle.messaging.participants, "markRead");
    await expect(
      loadInboxThreadView("nonexistent-thread", fakePhotographerSession(), deps),
    ).rejects.toThrow("__notFound__");
    expect(markReadSpy).not.toHaveBeenCalled();
  });

  it("on participant: markRead → fetch → return view; logger.info written; counter NOT incremented", async () => {
    const deps = bundleWithProfiles();
    const { threadId } = await createOrFindDirectThread(MODEL_ID, "work:w1", {
      session: fakePhotographerSession(),
      ...deps,
    });
    const { logger, records } = createCapturingLogger();

    const view = await loadInboxThreadView(threadId, fakePhotographerSession(), {
      bundle: deps.bundle,
      logger,
    });

    expect(view.thread.id).toBe(threadId);
    expect(view.callerProfileId).toBe(PHOTOGRAPHER_ID);
    expect(view.counterpartProfileId).toBe(MODEL_ID);
    expect(view.messages).toEqual([]);

    // markRead recorded log entry
    const ssrLog = records.find(
      (r) =>
        r.event === "messaging.action.completed" &&
        (r.ctx as { actionName?: string })?.actionName ===
          "messaging/markThreadRead.ssr",
    );
    expect(ssrLog).toBeDefined();

    // counter must NOT increment via SSR-side markRead path
    expect(deps.metrics.snapshot().messaging.threads_read).toBe(0);

    // Participant's last_read_at is updated
    const parts = await deps.bundle.messaging.participants.listForThread(
      threadId,
    );
    const self = parts.find((p) => p.accountId === PHOTOGRAPHER_ID);
    expect(self?.lastReadAt).toBeTruthy();
  });
});
