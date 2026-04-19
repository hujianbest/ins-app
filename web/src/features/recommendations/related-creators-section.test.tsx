// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RelatedCreatorsSection } from "./related-creators-section";
import {
  createRecommendationsTestDeps,
  fakeCreatorProfile,
} from "./test-support";

const SEED = { role: "photographer" as const, slug: "seed" };

async function renderAsync(node: React.ReactElement) {
  // Resolve async server component to a sync element before rendering.
  const resolved = await Promise.resolve(node);
  return render(resolved as React.ReactElement);
}

describe("recommendations/RelatedCreatorsSection", () => {
  it("renders no DOM (no panel, no beacon) when flag is disabled", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed" }),
        fakeCreatorProfile({ slug: "alpha" }),
      ],
      works: [],
    });

    const node = await RelatedCreatorsSection({
      seed: SEED,
      deps: { ...deps, flagEnabled: false },
    });
    expect(node).toBeNull();
  });

  it("renders the empty-state copy when no candidates exist", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [fakeCreatorProfile({ slug: "seed" })],
      works: [],
    });

    const node = await RelatedCreatorsSection({ seed: SEED, deps });
    expect(node).not.toBeNull();
    const { container } = await renderAsync(node as React.ReactElement);
    expect(container.querySelector("section")).not.toBeNull();
    expect(container.textContent).toContain("暂无更多相关创作者");
    expect(container.querySelectorAll("article").length).toBe(0);
    expect(container.querySelectorAll("a").length).toBe(0);
  });

  it("renders cards + heading when candidates exist", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed", city: "shanghai", shootingFocus: "portrait" }),
        fakeCreatorProfile({ slug: "alpha", name: "Alpha", city: "shanghai", shootingFocus: "portrait" }),
        fakeCreatorProfile({ slug: "bravo", name: "Bravo", city: "beijing", shootingFocus: "landscape" }),
      ],
      works: [],
    });

    const node = await RelatedCreatorsSection({ seed: SEED, deps });
    const { container } = await renderAsync(node as React.ReactElement);
    expect(container.textContent).toContain("也看看这些创作者");
    expect(container.textContent).toContain("Alpha");
    expect(container.textContent).toContain("Bravo");

    const links = Array.from(container.querySelectorAll("a"))
      .map((a) => a.getAttribute("href"))
      .filter(Boolean);
    expect(links).toContain("/photographers/alpha");
    expect(links).toContain("/photographers/bravo");

    // Heading uses h2 from SectionHeading, card titles use h3
    expect(container.querySelectorAll("h2").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll("h3").length).toBeGreaterThanOrEqual(2);
  });

  it("uses card grid that hides cards in DOM order with stable scoring", async () => {
    const deps = createRecommendationsTestDeps({
      profiles: [
        fakeCreatorProfile({ slug: "seed", city: "shanghai", shootingFocus: "portrait" }),
        fakeCreatorProfile({ slug: "low", city: "beijing", shootingFocus: "landscape" }),
        fakeCreatorProfile({ slug: "high", city: "shanghai", shootingFocus: "portrait" }),
        fakeCreatorProfile({ slug: "mid", city: "shanghai", shootingFocus: "landscape" }),
      ],
      works: [],
    });

    const node = await RelatedCreatorsSection({ seed: SEED, deps });
    const { container } = await renderAsync(node as React.ReactElement);
    const linkOrder = Array.from(container.querySelectorAll("a"))
      .map((a) => a.getAttribute("href") ?? "")
      .filter((h) => h.startsWith("/photographers/"));
    expect(linkOrder).toEqual([
      "/photographers/high",
      "/photographers/mid",
      "/photographers/low",
    ]);
  });
});
