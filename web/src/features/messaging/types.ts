/**
 * Phase 2 — Threaded Messaging V1 (FR-001).
 *
 * Re-exports the canonical messaging types from
 * `@/features/community/types` so feature code can import from a
 * single `@/features/messaging/types` namespace.
 */
export type {
  ThreadKind,
  MessageKind,
  ParticipantRole,
  MessageThreadRecord,
  MessageThreadParticipantRecord,
  MessageRecord,
  CreateDirectThreadInput,
  AppendMessageInput,
  InboxThreadProjection,
  MessageThreadRepository,
  MessageRepository,
  ParticipantRepository,
  MessagingRepositoryBundle,
} from "@/features/community/types";
