import { describe, expect, it, vi } from "vitest";

import type { PublicProfile } from "@/features/showcase/types";

const {
  getPublicProfilePageModelMock,
  getSessionContextMock,
  recordDiscoveryEventMock,
} = vi.hoisted(() => ({
  getPublicProfilePageModelMock: vi.fn(),
  getSessionContextMock: vi.fn(),
  recordDiscoveryEventMock: vi.fn(),
}));

vi.mock("@/features/community/public-read-model", () => ({
  getPublicProfilePageModel: getPublicProfilePageModelMock,
}));

vi.mock("@/features/auth/session", () => ({
  getSessionContext: getSessionContextMock,
}));

vi.mock("@/features/discovery/events", () => ({
  buildDiscoveryProfileTargetId: vi.fn(
    (role: string, slug: string) => `${role}:${slug}`,
  ),
  recordDiscoveryEvent: recordDiscoveryEventMock,
}));

import { GET } from "./route";

const photographerProfile: PublicProfile = {
  slug: "repo-photographer",
  role: "photographer",
  name: "Repo Avery",
  city: "上海",
  shootingFocus: "编辑人像",
  discoveryContext: "希望被上海品牌团队与长期合作模特看到",
  externalHandoffUrl: "https://portfolio.example.com/repo-avery",
  publishedAt: "2026-04-09T09:00:00Z",
  tagline: "repository backed profile",
  bio: "Repo biography",
  contactLabel: "联系摄影师",
  sectionTitle: "精选画面",
  sectionDescription: "只展示已发布作品。",
  heroImageLabel: "摄影师封面视觉",
  showcaseItems: [],
};

describe("GET /outbound/[role]/[slug]", () => {
  it("redirects to the creator external handoff url when configured", async () => {
    getSessionContextMock.mockResolvedValue({
      status: "guest",
      isAuthenticated: false,
      accountId: null,
      primaryRole: null,
    });
    getPublicProfilePageModelMock.mockResolvedValue(photographerProfile);

    const response = await GET(
      new Request("http://localhost:3000/outbound/photographer/repo-photographer"),
      {
        params: Promise.resolve({
          role: "photographer",
          slug: "repo-photographer",
        }),
      },
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      photographerProfile.externalHandoffUrl,
    );
    expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "external_handoff_click",
        targetId: "photographer:repo-photographer",
        success: true,
      }),
    );
  });

  it("returns 404 when the creator has no external handoff url", async () => {
    getSessionContextMock.mockResolvedValue({
      status: "guest",
      isAuthenticated: false,
      accountId: null,
      primaryRole: null,
    });
    getPublicProfilePageModelMock.mockResolvedValue({
      ...photographerProfile,
      externalHandoffUrl: "",
    });

    const response = await GET(
      new Request("http://localhost:3000/outbound/photographer/repo-photographer"),
      {
        params: Promise.resolve({
          role: "photographer",
          slug: "repo-photographer",
        }),
      },
    );

    expect(response.status).toBe(404);
    expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "external_handoff_click",
        targetId: "photographer:repo-photographer",
        success: false,
        failureReason: "missing_external_handoff_url",
      }),
    );
  });
});
