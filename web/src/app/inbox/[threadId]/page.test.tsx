import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { createInMemoryCommunityRepositoryBundle } from "@/features/community/test-support";
import type { SessionContext } from "@/features/auth/types";

const {
  redirectMock,
  notFoundMock,
  getSessionContextMock,
  getDefaultCommunityRepositoryBundleMock,
  getObservabilityMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
  notFoundMock: vi.fn(() => {
    throw new Error("__notFound__");
  }),
  getSessionContextMock: vi.fn(),
  getDefaultCommunityRepositoryBundleMock: vi.fn(),
  getObservabilityMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  notFound: notFoundMock,
  useRouter: () => ({ refresh: () => {} }),
}));
vi.mock("@/features/auth/session", () => ({
  getSessionContext: getSessionContextMock,
}));
vi.mock("@/features/community/runtime", () => ({
  getDefaultCommunityRepositoryBundle: getDefaultCommunityRepositoryBundleMock,
}));
vi.mock("@/features/observability/init", () => ({
  getObservability: getObservabilityMock,
}));
vi.mock("@/features/messaging/thread-actions", () => ({
  sendMessageForm: vi.fn(),
}));

import ThreadDetailPage from "./page";

function authPhotographerSession(): SessionContext {
  return {
    status: "authenticated",
    isAuthenticated: true,
    accountId: "account:test:photographer",
    primaryRole: "photographer",
    email: "p@test.lens-archive.local",
  };
}

function guestSession(): SessionContext {
  return {
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  };
}

const PHOTOGRAPHER_ID = "photographer:sample-photographer";
const MODEL_ID = "model:sample-model";

function emptyObservability() {
  return {
    metrics: { incrementCounter: () => {}, snapshot: () => ({}) },
    logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
    errorReporter: { report: () => {} },
  };
}

test("thread detail redirects guest to /login", async () => {
  redirectMock.mockClear();
  notFoundMock.mockClear();
  getSessionContextMock.mockResolvedValue(guestSession());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    createInMemoryCommunityRepositoryBundle({ profiles: [], works: [] }),
  );
  getObservabilityMock.mockReturnValue(emptyObservability());

  await expect(
    ThreadDetailPage({
      params: Promise.resolve({ threadId: "any" }),
      searchParams: Promise.resolve({}),
    }),
  ).rejects.toThrow("__redirect__:/login");
  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("thread detail returns notFound for non-participant", async () => {
  redirectMock.mockClear();
  notFoundMock.mockClear();
  getSessionContextMock.mockResolvedValue(authPhotographerSession());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    createInMemoryCommunityRepositoryBundle({ profiles: [], works: [] }),
  );
  getObservabilityMock.mockReturnValue(emptyObservability());

  await expect(
    ThreadDetailPage({
      params: Promise.resolve({ threadId: "nonexistent" }),
      searchParams: Promise.resolve({}),
    }),
  ).rejects.toThrow("__notFound__");
  expect(notFoundMock).toHaveBeenCalled();
});

test("thread detail renders messages timeline + form for participant", async () => {
  redirectMock.mockClear();
  notFoundMock.mockClear();
  getSessionContextMock.mockResolvedValue(authPhotographerSession());
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: [],
    works: [],
  });
  const { id: threadId } = await bundle.messaging.threads.createDirectThread({
    initiatorAccountId: PHOTOGRAPHER_ID,
    recipientAccountId: MODEL_ID,
    contextRef: "work:w1",
  });
  await bundle.messaging.messages.appendMessage({
    threadId,
    authorAccountId: MODEL_ID,
    body: "hello from model",
  });
  await bundle.messaging.messages.appendMessage({
    threadId,
    authorAccountId: PHOTOGRAPHER_ID,
    body: "reply from photographer",
  });
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundle);
  getObservabilityMock.mockReturnValue(emptyObservability());

  const page = await ThreadDetailPage({
    params: Promise.resolve({ threadId }),
    searchParams: Promise.resolve({}),
  });
  render(page);

  expect(screen.getByText("hello from model")).toBeDefined();
  expect(screen.getByText("reply from photographer")).toBeDefined();
  expect(screen.getByLabelText(/消息正文/)).toBeDefined();
  expect(screen.getByRole("button", { name: /发送/ })).toBeDefined();

  // Counterpart name appears in PageHero h1
  expect(screen.getByRole("heading", { level: 1, name: /sample-model/ })).toBeDefined();

  // markRead recorded last_read_at
  const parts = await bundle.messaging.participants.listForThread(threadId);
  const self = parts.find((p) => p.accountId === PHOTOGRAPHER_ID);
  expect(self?.lastReadAt).toBeTruthy();
});

test("thread detail renders ?error= alert with mapped Chinese copy", async () => {
  redirectMock.mockClear();
  notFoundMock.mockClear();
  getSessionContextMock.mockResolvedValue(authPhotographerSession());
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: [],
    works: [],
  });
  const { id: threadId } = await bundle.messaging.threads.createDirectThread({
    initiatorAccountId: PHOTOGRAPHER_ID,
    recipientAccountId: MODEL_ID,
  });
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundle);
  getObservabilityMock.mockReturnValue(emptyObservability());

  const page = await ThreadDetailPage({
    params: Promise.resolve({ threadId }),
    searchParams: Promise.resolve({ error: "message_too_long" }),
  });
  render(page);

  expect(screen.getByRole("alert")).toBeDefined();
  expect(screen.getByText(/消息过长/)).toBeDefined();
});
