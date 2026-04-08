import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const { getSessionRoleMock } = vi.hoisted(() => ({
  getSessionRoleMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  getSessionRole: getSessionRoleMock,
}));

import { opportunityPosts } from "@/features/showcase/sample-data";

import OpportunityDetailPage from "./page";

test("opportunity detail page renders the post content and owner summary", async () => {
  getSessionRoleMock.mockResolvedValue("model");

  const page = await OpportunityDetailPage({
    params: Promise.resolve({ postId: "shanghai-editorial-casting" }),
  });

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: opportunityPosts[0].title,
    })
  ).toBeDefined();
  expect(screen.getByText(opportunityPosts[0].summary)).toBeDefined();
  expect(screen.getByText(opportunityPosts[0].city)).toBeDefined();
  expect(screen.getByText(opportunityPosts[0].schedule)).toBeDefined();
  expect(screen.getByText(opportunityPosts[0].ownerName)).toBeDefined();
  expect(screen.getByRole("link", { name: /返回诉求列表/ }).getAttribute("href")).toBe(
    "/opportunities"
  );
  expect(screen.getByRole("link", { name: /查看摄影师主页/ }).getAttribute("href")).toBe(
    "/photographers/sample-photographer"
  );
  expect(screen.getByRole("button", { name: /发送关于该诉求的私信/ })).toBeDefined();
});
