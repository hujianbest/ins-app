// @vitest-environment node
import { describe, expect, it } from "vitest";

import { AppError } from "@/features/observability/errors";

import { runMessagingAction } from "./runtime";
import {
  createMessagingTestDeps,
  fakeGuestSession,
  fakePhotographerSession,
} from "./test-support";

describe("messaging/runtime > runMessagingAction", () => {
  it("rejects guest sessions with unauthenticated (401)", async () => {
    const deps = createMessagingTestDeps();
    await expect(
      runMessagingAction({
        actionName: "messaging/sendMessage",
        session: fakeGuestSession(),
        ...deps,
        fn: async () => "should not be called",
      }),
    ).rejects.toMatchObject({ code: "unauthenticated", status: 401 });
    expect(
      deps.capturedLogs.find((r) => r.event === "messaging.action.completed"),
    ).toBeUndefined();
  });

  it("invokes fn and writes messaging.action.completed log on success", async () => {
    const deps = createMessagingTestDeps();
    const result = await runMessagingAction({
      actionName: "messaging/sendMessage",
      session: fakePhotographerSession(),
      ...deps,
      fn: async (ctx) => {
        expect(ctx.session.status).toBe("authenticated");
        return "ok";
      },
    });
    expect(result).toBe("ok");
    const completed = deps.capturedLogs.find(
      (r) => r.event === "messaging.action.completed" && r.level === "info",
    );
    expect(completed).toBeDefined();
    const ctx = completed?.ctx as Record<string, unknown> | undefined;
    expect(ctx).toMatchObject({
      module: "messaging",
      actionName: "messaging/sendMessage",
    });
  });

  it("writes messaging.action.failed warn log and rethrows when fn throws", async () => {
    const deps = createMessagingTestDeps();
    await expect(
      runMessagingAction({
        actionName: "messaging/sendMessage",
        session: fakePhotographerSession(),
        ...deps,
        fn: async () => {
          throw new AppError({ code: "forbidden_thread", status: 403 });
        },
      }),
    ).rejects.toMatchObject({ code: "forbidden_thread", status: 403 });
    const failed = deps.capturedLogs.find(
      (r) => r.event === "messaging.action.failed" && r.level === "warn",
    );
    expect(failed).toBeDefined();
  });

  it("falls back to direct execution when bundle has no withTransaction", async () => {
    const deps = createMessagingTestDeps();
    let invoked = false;
    await runMessagingAction({
      actionName: "messaging/sendMessage",
      session: fakePhotographerSession(),
      ...deps,
      fn: async () => {
        invoked = true;
      },
    });
    expect(invoked).toBe(true);
  });
});
