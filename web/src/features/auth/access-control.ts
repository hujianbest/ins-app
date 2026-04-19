import { getAdminAccountEmails } from "@/config/env";

import { getSessionContext } from "./session";

import type {
  AccessControl,
  AdminCapabilityPolicy,
  AdminGuard,
  CreatorCapabilityPolicy,
  SessionContext,
  StudioGuard,
} from "./types";

export function createCreatorCapabilityPolicy(
  session: SessionContext,
): CreatorCapabilityPolicy {
  const isCreator =
    session.status === "authenticated" &&
    (session.primaryRole === "photographer" || session.primaryRole === "model");

  return {
    isCreator,
    canManageCreatorProfile: isCreator,
    canPublishWorks: isCreator,
  };
}

export function createStudioGuard(
  session: SessionContext,
  creatorCapability: CreatorCapabilityPolicy,
): StudioGuard {
  if (
    session.status !== "authenticated" ||
    (!creatorCapability.canManageCreatorProfile &&
      !creatorCapability.canPublishWorks)
  ) {
    return {
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    };
  }

  return {
    allowed: true,
    redirectTo: null,
    reason: "allowed",
  };
}

/**
 * Phase 2 — Ops Back Office V1 (FR-001 / I-1).
 *
 * Pure function: maps a `SessionContext` + admin-email allowlist to
 * an `AdminCapabilityPolicy`. Both sides are normalised to lowercase
 * before comparison (the session email is already lowercase per
 * `auth_accounts.email UNIQUE`; the env loader normalises the
 * allowlist).
 */
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

/**
 * Phase 2 — Ops Back Office V1 (FR-001 / I-2 / I-3).
 *
 * Pure function: collapses session + admin capability into a binary
 * "may enter /studio/admin/**" decision plus the redirect target
 * for guarded SSR routes.
 */
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

export function createAccessControl(
  session: SessionContext,
  adminEmails: ReadonlySet<string> = getAdminAccountEmails(),
): AccessControl {
  const creatorCapability = createCreatorCapabilityPolicy(session);
  const adminCapability = createAdminCapabilityPolicy(session, adminEmails);
  const adminGuard = createAdminGuard(session, adminCapability);

  return {
    session,
    creatorCapability,
    studioGuard: createStudioGuard(session, creatorCapability),
    adminCapability,
    adminGuard,
  };
}

export async function getRequestAccessControl(): Promise<AccessControl> {
  return createAccessControl(await getSessionContext());
}
