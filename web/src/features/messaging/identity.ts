import type { AuthenticatedSessionContext } from "@/features/auth/types";
import { getStudioProfileSlugForRole } from "@/features/showcase/sample-data";

/**
 * Phase 2 — Threaded Messaging V1 (§1 ID space assumption + A-007).
 *
 * Maps the calling session to the creator profile id that messaging
 * uses as the participant identity. In Phase 1 we don't yet have a
 * 1:1 account_id ↔ profile id link in `creator_profiles`; the same
 * primary role shares a single seed profile slug. After §3.1
 * PostgreSQL migration adds `creator_profiles.account_id`, this
 * helper becomes a single-line lookup.
 */
export function resolveCallerProfileId(
  session: AuthenticatedSessionContext,
): string {
  const slug = getStudioProfileSlugForRole(session.primaryRole);
  return `${session.primaryRole}:${slug}`;
}
