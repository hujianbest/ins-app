import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { HomeDiscoverySection } from "./home-discovery-section";

test.each([
  {
    kind: "works" as const,
    title: "Featured works",
    description: "Recent work highlights.",
    emptyStateCopy: /new work highlights are coming soon/i,
  },
  {
    kind: "profiles" as const,
    title: "Featured profiles",
    description: "Meet creators ready for collaboration.",
    emptyStateCopy: /new profile picks are coming soon/i,
  },
  {
    kind: "opportunities" as const,
    title: "Featured opportunities",
    description: "Browse booking calls.",
    emptyStateCopy: /new booking calls are coming soon/i,
  },
])("home discovery section keeps its shell and empty-state copy for $kind", ({
  kind,
  title,
  description,
  emptyStateCopy,
}) => {
  render(
    <HomeDiscoverySection
      section={{
        kind,
        title,
        description,
        items: [],
      }}
    />
  );

  expect(screen.getByRole("heading", { level: 2, name: title })).toBeDefined();
  expect(screen.getByText(description)).toBeDefined();
  expect(screen.getByText(emptyStateCopy)).toBeDefined();
});
