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

export function createAccessControl(session: SessionContext): AccessControl {
  const creatorCapability = createCreatorCapabilityPolicy(session);

  return {
    session,
    creatorCapability,
    studioGuard: createStudioGuard(session, creatorCapability),
  };
}

export async function getRequestAccessControl(): Promise<AccessControl> {
  return createAccessControl(await getSessionContext());
}
