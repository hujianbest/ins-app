import { getAdminAccountEmails } from "@/config/env";

import { getSessionContext } from "./session";

import type {
  AccessControl,
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

// Phase 2 — Ops Back Office V1 (FR-001):
// admin policy / guard live in features/admin so they can be unit
// tested without dragging in `auth-store.ts` (which imports
// `node:sqlite` and currently breaks the vite test bundler).
export {
  createAdminCapabilityPolicy,
  createAdminGuard,
} from "@/features/admin/admin-policy";
import {
  createAdminCapabilityPolicy as createAdminCapabilityPolicyImpl,
  createAdminGuard as createAdminGuardImpl,
} from "@/features/admin/admin-policy";

export function createAccessControl(
  session: SessionContext,
  adminEmails: ReadonlySet<string> = getAdminAccountEmails(),
): AccessControl {
  const creatorCapability = createCreatorCapabilityPolicy(session);
  const adminCapability = createAdminCapabilityPolicyImpl(session, adminEmails);
  const adminGuard = createAdminGuardImpl(session, adminCapability);

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
