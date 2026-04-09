import { expect, test } from "vitest";

import { createAccessControl } from "./access-control";
import { resolveSessionContext } from "./session";

test("creator capability policy also keeps photographer accounts eligible for studio publishing flows", () => {
  const accessControl = createAccessControl(resolveSessionContext("photographer"));

  expect(accessControl.session).toMatchObject({
    status: "authenticated",
    primaryRole: "photographer",
  });
  expect(accessControl.creatorCapability).toMatchObject({
    canManageCreatorProfile: true,
    canPublishWorks: true,
  });
  expect(accessControl.studioGuard).toMatchObject({
    allowed: true,
    redirectTo: null,
  });
});

test("creator capability policy keeps model accounts eligible for studio publishing flows", () => {
  const accessControl = createAccessControl(resolveSessionContext("model"));

  expect(accessControl.session).toMatchObject({
    status: "authenticated",
    primaryRole: "model",
  });
  expect(accessControl.creatorCapability).toMatchObject({
    canManageCreatorProfile: true,
    canPublishWorks: true,
  });
  expect(accessControl.studioGuard).toMatchObject({
    allowed: true,
    redirectTo: null,
  });
});

test("invalid session values fall back to guest and stay blocked by studio guard", () => {
  const accessControl = createAccessControl(resolveSessionContext("invalid-role"));

  expect(accessControl.session).toMatchObject({
    status: "guest",
    primaryRole: null,
  });
  expect(accessControl.creatorCapability).toMatchObject({
    canManageCreatorProfile: false,
    canPublishWorks: false,
  });
  expect(accessControl.studioGuard).toMatchObject({
    allowed: false,
    redirectTo: "/login",
    reason: "unauthenticated",
  });
});

test("missing session values also fall back to guest", () => {
  const accessControl = createAccessControl(resolveSessionContext(undefined));

  expect(accessControl.session).toMatchObject({
    status: "guest",
    primaryRole: null,
  });
  expect(accessControl.studioGuard).toMatchObject({
    allowed: false,
    redirectTo: "/login",
    reason: "unauthenticated",
  });
});
