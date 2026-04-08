import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

const { resolveHomeDiscoverySectionsMock } = vi.hoisted(() => ({
  resolveHomeDiscoverySectionsMock: vi.fn(),
}));

vi.mock("@/features/home-discovery/resolver", () => ({
  resolveHomeDiscoverySections: resolveHomeDiscoverySectionsMock,
}));

import Home from "./page";

afterEach(() => {
  cleanup();
  resolveHomeDiscoverySectionsMock.mockReset();
});

test.each([
  {
    emptyKind: "works",
    emptyStateCopy: /new work highlights are coming soon/i,
  },
  {
    emptyKind: "profiles",
    emptyStateCopy: /new profile picks are coming soon/i,
  },
  {
    emptyKind: "opportunities",
    emptyStateCopy: /new booking calls are coming soon/i,
  },
])(
  "home page keeps the hero and empty discovery shell visible when $emptyKind section has no items",
  ({ emptyKind, emptyStateCopy }) => {
    resolveHomeDiscoverySectionsMock.mockReturnValue([
      {
        kind: "works",
        title: "Featured works",
        description: "Recent work highlights.",
        items:
          emptyKind === "works"
            ? []
            : [
                {
                  id: "work-1",
                  href: "/works/work-1",
                  badge: "Editorial portrait",
                  title: "Test Work",
                  description: "A highlighted work card.",
                },
              ],
      },
      {
        kind: "profiles",
        title: "Featured profiles",
        description: "Meet creators ready for collaboration.",
        items:
          emptyKind === "profiles"
            ? []
            : [
                {
                  id: "profile-1",
                  href: "/photographers/test-profile",
                  badge: "Photographer",
                  title: "Test Profile",
                  description: "A creator ready for collaboration.",
                },
              ],
      },
      {
        kind: "opportunities",
        title: "Featured opportunities",
        description: "Browse booking calls.",
        items:
          emptyKind === "opportunities"
            ? []
            : [
                {
                  id: "post-1",
                  href: "/opportunities/post-1",
                  badge: "Shanghai",
                  title: "Test Opportunity",
                  description: "A live booking request.",
                },
              ],
      },
    ]);

    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: /lens archive/i })).toBeDefined();
    expect(screen.getByText(emptyStateCopy)).toBeDefined();

    if (emptyKind !== "works") {
      expect(screen.getByText("Test Work").closest("a")?.getAttribute("href")).toBe("/works/work-1");
    }

    if (emptyKind !== "profiles") {
      expect(screen.getByText("Test Profile").closest("a")?.getAttribute("href")).toBe(
        "/photographers/test-profile"
      );
    }

    if (emptyKind !== "opportunities") {
      expect(screen.getByText("Test Opportunity").closest("a")?.getAttribute("href")).toBe(
        "/opportunities/post-1"
      );
    }
  }
);
