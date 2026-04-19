/**
 * Phase 2 — Ops Back Office V1 (FR-001).
 *
 * Pure-function admin policy + guard. Defined in this file (rather
 * than re-exported from `@/features/auth/access-control`) so unit
 * tests can import without dragging in `auth-store.ts` which itself
 * imports `node:sqlite` and is currently incompatible with the vite
 * test bundler. `auth/access-control.ts` re-exports these helpers to
 * keep its public API surface intact.
 */
import type {
  AdminCapabilityPolicy,
  AdminGuard,
  SessionContext,
} from "@/features/auth/types";

export type { AdminCapabilityPolicy, AdminGuard };

export function createAdminCapabilityPolicy(
  session: SessionContext,
  adminEmails: ReadonlySet<string>,
): AdminCapabilityPolicy {
  if (session.status !== "authenticated") {
    return { isAdmin: false, email: null };
  }
  const candidate = session.email.toLowerCase();
  if (adminEmails.has(candidate)) {
    return { isAdmin: true, email: candidate };
  }
  return { isAdmin: false, email: null };
}

export function createAdminGuard(
  session: SessionContext,
  capability: AdminCapabilityPolicy,
): AdminGuard {
  if (session.status !== "authenticated") {
    return {
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    };
  }
  if (!capability.isAdmin) {
    return {
      allowed: false,
      redirectTo: "/studio",
      reason: "not_admin",
    };
  }
  return { allowed: true, redirectTo: null, reason: "allowed" };
}
