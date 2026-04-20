import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { createInMemoryCommunityRepositoryBundle } from "@/features/community/test-support";
import { createMetricsRegistry } from "@/features/observability/metrics";
import type { SessionContext } from "@/features/auth/types";

const {
  redirectMock,
  getSessionContextMock,
  getDefaultCommunityRepositoryBundleMock,
  getObservabilityMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getSessionContextMock: vi.fn(),
  getDefaultCommunityRepositoryBundleMock: vi.fn(),
  getObservabilityMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/features/auth/session", () => ({
  getSessionContext: getSessionContextMock,
}));
vi.mock("@/features/community/runtime", () => ({
  getDefaultCommunityRepositoryBundle: getDefaultCommunityRepositoryBundleMock,
}));
vi.mock("@/features/observability/init", () => ({
  getObservability: getObservabilityMock,
}));

import InboxPage from "./page";

function authenticatedSession(): SessionContext {
  return {
    status: "authenticated",
    isAuthenticated: true,
    accountId: "account:test:photographer",
    primaryRole: "photographer",
    email: "photographer@test.lens-archive.local",
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

test("inbox redirects guest to /login", async () => {
  redirectMock.mockReset();
  redirectMock.mockImplementation(() => {
    throw new Error("redirected");
  });
  getSessionContextMock.mockResolvedValue(guestSession());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    createInMemoryCommunityRepositoryBundle({ profiles: [], works: [] }),
  );
  getObservabilityMock.mockReturnValue({
    metrics: createMetricsRegistry(),
    logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
    errorReporter: { report: () => {} },
  });

  await expect(InboxPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
    "redirected",
  );
  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("inbox renders empty state for both sections when authenticated user has no threads / notifications", async () => {
  redirectMock.mockReset();
  getSessionContextMock.mockResolvedValue(authenticatedSession());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    createInMemoryCommunityRepositoryBundle({ profiles: [], works: [] }),
  );
  getObservabilityMock.mockReturnValue({
    metrics: createMetricsRegistry(),
    logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
    errorReporter: { report: () => {} },
  });

  const page = await InboxPage({ searchParams: Promise.resolve({}) });
  render(page);

  expect(
    screen.getByRole("heading", { level: 1, name: /消息/ }),
  ).toBeDefined();
  expect(screen.getByText(/暂无对话/)).toBeDefined();
  expect(screen.getByText(/暂无系统通知/)).toBeDefined();
});

test("inbox renders thread cards + system notifications when data exists", async () => {
  redirectMock.mockReset();
  getSessionContextMock.mockResolvedValue(authenticatedSession());
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: [],
    works: [
      {
        id: "w1",
        ownerProfileId: "photographer:sample-photographer",
        ownerRole: "photographer",
        ownerSlug: "sample-photographer",
        ownerName: "Owner",
        status: "published",
        title: "Owned Work",
        category: "portrait",
        description: "",
        detailNote: "",
        coverAsset: "",
        publishedAt: "2026-04-19T00:00:00.000Z",
        updatedAt: "2026-04-19T00:00:00.000Z",
      },
    ],
    comments: [
      {
        id: "c1",
        workId: "w1",
        authorAccountId: "account:fan",
        body: "great!",
        createdAt: "2026-04-19T03:00:00.000Z",
      },
    ],
  });
  // Pre-create one thread for the photographer
  await bundle.messaging.threads.createDirectThread({
    initiatorAccountId: "photographer:sample-photographer",
    recipientAccountId: "model:sample-model",
    contextRef: "work:w1",
  });
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundle);
  const metrics = createMetricsRegistry();
  getObservabilityMock.mockReturnValue({
    metrics,
    logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
    errorReporter: { report: () => {} },
  });

  const page = await InboxPage({ searchParams: Promise.resolve({}) });
  const { container } = render(page);

  // Direct messages section: one thread card linking to /inbox/<id>
  const links = Array.from(container.querySelectorAll("a")).map((a) =>
    a.getAttribute("href"),
  );
  expect(links.some((h) => h?.startsWith("/inbox/"))).toBe(true);
  // Counterpart name visible (model:sample-model)
  expect(screen.getByText("model:sample-model")).toBeDefined();
  // Context link tag visible
  expect(screen.getByText("来自作品 #w1")).toBeDefined();

  // System notifications: comment notification visible (c1)
  expect(screen.getByText(/account:fan 评论了你的作品/)).toBeDefined();

  // Counter incremented
  expect(metrics.snapshot().messaging.system_notifications_listed).toBe(1);
});

test("inbox renders ?error= alert with mapped Chinese copy", async () => {
  redirectMock.mockReset();
  getSessionContextMock.mockResolvedValue(authenticatedSession());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    createInMemoryCommunityRepositoryBundle({ profiles: [], works: [] }),
  );
  getObservabilityMock.mockReturnValue({
    metrics: createMetricsRegistry(),
    logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
    errorReporter: { report: () => {} },
  });

  const page = await InboxPage({
    searchParams: Promise.resolve({ error: "forbidden_thread" }),
  });
  render(page);

  expect(screen.getByRole("alert")).toBeDefined();
  expect(screen.getByText(/没有访问该消息的权限/)).toBeDefined();
});

test("inbox does NOT increment counter on guest redirect path", async () => {
  redirectMock.mockReset();
  redirectMock.mockImplementation(() => {
    throw new Error("redirected");
  });
  getSessionContextMock.mockResolvedValue(guestSession());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    createInMemoryCommunityRepositoryBundle({ profiles: [], works: [] }),
  );
  const metrics = createMetricsRegistry();
  getObservabilityMock.mockReturnValue({
    metrics,
    logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
    errorReporter: { report: () => {} },
  });

  await expect(
    InboxPage({ searchParams: Promise.resolve({}) }),
  ).rejects.toThrow("redirected");
  expect(metrics.snapshot().messaging.system_notifications_listed).toBe(0);
});
