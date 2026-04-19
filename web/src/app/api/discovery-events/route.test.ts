import { describe, expect, it, vi } from "vitest";

const { getSessionContextMock, recordDiscoveryEventMock } = vi.hoisted(() => ({
  getSessionContextMock: vi.fn(),
  recordDiscoveryEventMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  getSessionContext: getSessionContextMock,
}));

vi.mock("@/features/discovery/events", () => ({
  recordDiscoveryEvent: recordDiscoveryEventMock,
}));

import { POST } from "./route";

describe("POST /api/discovery-events", () => {
  it("records a view event with the current session actor", async () => {
    getSessionContextMock.mockResolvedValue({
      status: "authenticated",
      isAuthenticated: true,
      accountId: "account:test:photographer",
      primaryRole: "photographer",
    });

    const response = await POST(
      new Request("http://localhost:3000/api/discovery-events", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          eventType: "work_view",
          targetType: "work",
          targetId: "repo-work",
          targetProfileId: "photographer:repo-photographer",
          surface: "work_detail",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "work_view",
        actorAccountId: "account:test:photographer",
        targetId: "repo-work",
        success: true,
      }),
    );
  });

  it("records a related_card_view event for related creators surface", async () => {
    recordDiscoveryEventMock.mockReset();
    getSessionContextMock.mockResolvedValue({
      status: "guest",
      isAuthenticated: false,
      accountId: null,
      primaryRole: null,
    });

    const response = await POST(
      new Request("http://localhost:3000/api/discovery-events", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          eventType: "related_card_view",
          targetType: "profile",
          targetId: "photographer:foo",
          targetProfileId: "photographer:foo",
          surface: "related_creators_section",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "related_card_view",
        actorAccountId: null,
        targetType: "profile",
        targetId: "photographer:foo",
        surface: "related_creators_section",
        success: true,
      }),
    );
  });

  it("records a related_card_view event for related works surface", async () => {
    recordDiscoveryEventMock.mockReset();
    getSessionContextMock.mockResolvedValue({
      status: "authenticated",
      isAuthenticated: true,
      accountId: "account:test:viewer",
      primaryRole: "model",
    });

    const response = await POST(
      new Request("http://localhost:3000/api/discovery-events", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          eventType: "related_card_view",
          targetType: "work",
          targetId: "work-123",
          targetProfileId: "photographer:owner",
          surface: "related_works_section",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "related_card_view",
        actorAccountId: "account:test:viewer",
        targetType: "work",
        targetId: "work-123",
        surface: "related_works_section",
        success: true,
      }),
    );
  });
});
