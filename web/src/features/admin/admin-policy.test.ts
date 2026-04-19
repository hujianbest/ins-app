// @vitest-environment node
//
// Unit tests for admin policy / guard pure functions.
// Re-exported from features/auth/access-control via admin-policy.ts;
// importing through admin-policy keeps the test free from the
// node:sqlite bundling issue that affects auth-store.test.ts.
import { describe, expect, it } from "vitest";

import {
  createAdminCapabilityPolicy,
  createAdminGuard,
} from "./admin-policy";
import { fakeAdminSession, fakeGuestSession, fakeNonAdminSession } from "./test-support";

describe("features/admin/admin-policy > createAdminCapabilityPolicy", () => {
  it("returns isAdmin=false for guest sessions", () => {
    const result = createAdminCapabilityPolicy(
      fakeGuestSession(),
      new Set(["admin@example.com"]),
    );
    expect(result).toEqual({ isAdmin: false, email: null });
  });

  it("returns isAdmin=false when email not in allowlist", () => {
    const result = createAdminCapabilityPolicy(
      fakeNonAdminSession("user@example.com"),
      new Set(["admin@example.com"]),
    );
    expect(result).toEqual({ isAdmin: false, email: null });
  });

  it("returns isAdmin=true when email matches allowlist (case-insensitive)", () => {
    const result = createAdminCapabilityPolicy(
      fakeAdminSession("Admin@Example.com"),
      new Set(["admin@example.com"]),
    );
    expect(result).toEqual({ isAdmin: true, email: "admin@example.com" });
  });

  it("returns isAdmin=false when allowlist is empty (fail-closed I-2)", () => {
    const result = createAdminCapabilityPolicy(
      fakeAdminSession("admin@example.com"),
      new Set(),
    );
    expect(result).toEqual({ isAdmin: false, email: null });
  });
});

describe("features/admin/admin-policy > createAdminGuard", () => {
  it("redirects guest sessions to /login", () => {
    const session = fakeGuestSession();
    const cap = createAdminCapabilityPolicy(session, new Set());
    const guard = createAdminGuard(session, cap);
    expect(guard).toEqual({
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    });
  });

  it("redirects non-admin authenticated sessions to /studio", () => {
    const session = fakeNonAdminSession("user@example.com");
    const cap = createAdminCapabilityPolicy(
      session,
      new Set(["admin@example.com"]),
    );
    const guard = createAdminGuard(session, cap);
    expect(guard).toEqual({
      allowed: false,
      redirectTo: "/studio",
      reason: "not_admin",
    });
  });

  it("allows admin sessions", () => {
    const session = fakeAdminSession("admin@example.com");
    const cap = createAdminCapabilityPolicy(
      session,
      new Set(["admin@example.com"]),
    );
    const guard = createAdminGuard(session, cap);
    expect(guard).toEqual({
      allowed: true,
      redirectTo: null,
      reason: "allowed",
    });
  });
});
