export type AuthRole = "photographer" | "model";

export type SessionAccountId = string;

export type GuestSessionContext = {
  status: "guest";
  isAuthenticated: false;
  accountId: null;
  primaryRole: null;
};

export type AuthenticatedSessionContext = {
  status: "authenticated";
  isAuthenticated: true;
  accountId: SessionAccountId;
  primaryRole: AuthRole;
};

export type SessionContext =
  | GuestSessionContext
  | AuthenticatedSessionContext;

export type CreatorCapabilityPolicy = {
  isCreator: boolean;
  canManageCreatorProfile: boolean;
  canPublishWorks: boolean;
};

export type StudioGuard = {
  allowed: boolean;
  redirectTo: "/login" | null;
  reason: "allowed" | "unauthenticated";
};

export type AccessControl = {
  session: SessionContext;
  creatorCapability: CreatorCapabilityPolicy;
  studioGuard: StudioGuard;
};
