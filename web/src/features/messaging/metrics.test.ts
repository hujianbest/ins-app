// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

import {
  type MetricsRegistry,
  createMetricsRegistry,
} from "@/features/observability/metrics";

import {
  MESSAGING_COUNTER_NAMES,
  incrementMessagesSent,
  incrementSystemNotificationsListed,
  incrementThreadsCreated,
  incrementThreadsRead,
} from "./metrics";

let registry: MetricsRegistry;

beforeEach(() => {
  registry = createMetricsRegistry();
});

describe("messaging/metrics counter key constants", () => {
  it("exposes the canonical 4 counter keys", () => {
    expect(MESSAGING_COUNTER_NAMES).toEqual({
      threadsCreated: "messaging.threads_created",
      messagesSent: "messaging.messages_sent",
      threadsRead: "messaging.threads_read",
      systemNotificationsListed: "messaging.system_notifications_listed",
    });
  });
});

describe("messaging/metrics helpers", () => {
  it("incrementThreadsCreated → messaging.threads_created", () => {
    incrementThreadsCreated(registry);
    expect(registry.snapshot().messaging.threads_created).toBe(1);
  });
  it("incrementMessagesSent → messaging.messages_sent", () => {
    incrementMessagesSent(registry);
    incrementMessagesSent(registry);
    expect(registry.snapshot().messaging.messages_sent).toBe(2);
  });
  it("incrementThreadsRead → messaging.threads_read", () => {
    incrementThreadsRead(registry);
    expect(registry.snapshot().messaging.threads_read).toBe(1);
  });
  it("incrementSystemNotificationsListed → messaging.system_notifications_listed", () => {
    incrementSystemNotificationsListed(registry);
    expect(registry.snapshot().messaging.system_notifications_listed).toBe(1);
  });
});
