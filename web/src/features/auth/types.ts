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
  /**
   * Phase 2 — Ops Back Office V1 (ADR-4 / I-7).
   * Lowercase, mirrors `auth_accounts.email` exactly. Used to match
   * against `ADMIN_ACCOUNT_EMAILS` in `createAdminCapabilityPolicy`
   * without an additional sqlite roundtrip.
   */
  email: string;
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

/**
 * Phase 2 — Ops Back Office V1 (FR-001).
 * `email` carries the matched lowercase admin email when `isAdmin`
 * is true, so server actions can write `audit_log.actor_email`
 * without re-deriving it from session.
 */
export type AdminCapabilityPolicy = {
  isAdmin: boolean;
  email: string | null;
};

export type AdminGuard = {
  allowed: boolean;
  redirectTo: "/login" | "/studio" | null;
  reason: "allowed" | "unauthenticated" | "not_admin";
};

export type AccessControl = {
  session: SessionContext;
  creatorCapability: CreatorCapabilityPolicy;
  studioGuard: StudioGuard;
  /**
   * Phase 2 — Ops Back Office V1 (FR-001 / I-12). Always present;
   * `isAdmin === false` is the safe default for guests, non-admin
   * accounts, and when `ADMIN_ACCOUNT_EMAILS` is empty.
   */
  adminCapability: AdminCapabilityPolicy;
  adminGuard: AdminGuard;
};
