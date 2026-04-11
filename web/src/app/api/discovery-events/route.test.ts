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
});
