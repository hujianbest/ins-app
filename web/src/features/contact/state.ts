/**
 * Phase 2 — Threaded Messaging V1 (T69 contact migration).
 *
 * Cookie-based contact thread state has been removed in favor of
 * persistent messaging threads (`features/messaging/*`). Only the
 * `ContactSourceType` discriminator is still used by the public-page
 * "contact" buttons that bind into `startContactThreadAction`.
 */

export type ContactSourceType = "profile" | "work" | "opportunity";
