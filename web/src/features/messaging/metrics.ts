import type { MetricsRegistry } from "@/features/observability/metrics";

/**
 * Phase 2 — Threaded Messaging V1 (FR-008 / I-6 single source of
 * truth for counter key names; matches MESSAGING_COUNTER_NAMES in
 * observability/metrics.ts).
 */
export const MESSAGING_COUNTER_NAMES = {
  threadsCreated: "messaging.threads_created",
  messagesSent: "messaging.messages_sent",
  threadsRead: "messaging.threads_read",
  systemNotificationsListed: "messaging.system_notifications_listed",
} as const;

export function incrementThreadsCreated(registry: MetricsRegistry): void {
  registry.incrementCounter(MESSAGING_COUNTER_NAMES.threadsCreated);
}

export function incrementMessagesSent(registry: MetricsRegistry): void {
  registry.incrementCounter(MESSAGING_COUNTER_NAMES.messagesSent);
}

export function incrementThreadsRead(registry: MetricsRegistry): void {
  registry.incrementCounter(MESSAGING_COUNTER_NAMES.threadsRead);
}

export function incrementSystemNotificationsListed(
  registry: MetricsRegistry,
): void {
  registry.incrementCounter(MESSAGING_COUNTER_NAMES.systemNotificationsListed);
}
