// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createAuthenticatedSessionContext } from "@/features/auth/session";

import { resolveCallerProfileId } from "./identity";

describe("messaging/identity > resolveCallerProfileId", () => {
  it("returns photographer:sample-photographer for photographer session", () => {
    const session = createAuthenticatedSessionContext(
      "account:test:photographer",
      "photographer",
      "p@test.lens-archive.local",
    );
    if (session.status !== "authenticated") throw new Error("expected auth");
    expect(resolveCallerProfileId(session)).toBe(
      "photographer:sample-photographer",
    );
  });

  it("returns model:sample-model for model session", () => {
    const session = createAuthenticatedSessionContext(
      "account:test:model",
      "model",
      "m@test.lens-archive.local",
    );
    if (session.status !== "authenticated") throw new Error("expected auth");
    expect(resolveCallerProfileId(session)).toBe("model:sample-model");
  });
});
