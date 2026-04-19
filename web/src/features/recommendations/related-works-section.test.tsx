// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RelatedWorksSection } from "./related-works-section";
import {
  createRecommendationsTestDeps,
  fakeCreatorProfile,
  fakeWork,
} from "./test-support";

const SEED = { workId: "seed" };

async function renderAsync(node: React.ReactElement) {
  return render((await Promise.resolve(node)) as React.ReactElement);
}

describe("recommendations/RelatedWorksSection", () => {
  it("renders no DOM when flag is disabled", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [fakeCreatorProfile({ id: "photographer:A", slug: "owner-a" })],
      works: [
        fakeWork({ id: "seed", ownerProfileId: "photographer:A" }),
        fakeWork({ id: "alpha", ownerProfileId: "photographer:A" }),
      ],
    });
    const node = await RelatedWorksSection({
      seed: SEED,
      deps: { ...deps, flagEnabled: false },
    });
    expect(node).toBeNull();
  });

  it("renders empty-state copy when only the seed work is published", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [fakeCreatorProfile({ id: "photographer:A", slug: "owner-a" })],
      works: [fakeWork({ id: "seed", ownerProfileId: "photographer:A" })],
    });
    const node = await RelatedWorksSection({ seed: SEED, deps });
    const { container } = await renderAsync(node as React.ReactElement);
    expect(container.querySelector("section")).not.toBeNull();
    expect(container.textContent).toContain("暂无更多相关作品");
    expect(container.querySelectorAll("a").length).toBe(0);
  });

  it("renders cards + heading + correct work links", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ id: "photographer:A", slug: "owner-a", name: "Owner A" }),
        fakeCreatorProfile({ id: "photographer:B", slug: "owner-b", name: "Owner B" }),
      ],
      works: [
        fakeWork({ id: "seed", ownerProfileId: "photographer:A", ownerName: "Owner A", title: "Seed" }),
        fakeWork({ id: "alpha", ownerProfileId: "photographer:A", ownerName: "Owner A", title: "Alpha" }),
        fakeWork({ id: "bravo", ownerProfileId: "photographer:B", ownerName: "Owner B", title: "Bravo" }),
      ],
    });

    const node = await RelatedWorksSection({ seed: SEED, deps });
    const { container } = await renderAsync(node as React.ReactElement);
    expect(container.textContent).toContain("也看看这些作品");
    expect(container.textContent).toContain("Alpha");
    expect(container.textContent).toContain("Bravo");

    const links = Array.from(container.querySelectorAll("a"))
      .map((a) => a.getAttribute("href"))
      .filter(Boolean);
    expect(links).toContain("/works/alpha");
    expect(links).toContain("/works/bravo");
    expect(links).not.toContain("/works/seed");
  });
});
