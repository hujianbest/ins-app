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
} from "./types";

export { resolveCallerProfileId } from "./identity";
export { buildContextSourceLink, type ContextSourceLink } from "./context-link";

export {
  MESSAGING_COUNTER_NAMES,
  incrementMessagesSent,
  incrementSystemNotificationsListed,
  incrementThreadsCreated,
  incrementThreadsRead,
} from "./metrics";
