import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { HomeDiscoverySection } from "./home-discovery-section";

test.each([
  {
    kind: "featured" as const,
    title: "精选推荐",
    description: "优先推荐",
    emptyStateCopy: /暂无精选/i,
  },
  {
    kind: "latest" as const,
    title: "最新发布",
    description: "按时间浏览",
    emptyStateCopy: /暂无更新/i,
  },
  {
    kind: "following" as const,
    title: "关注中",
    description: "关注更新",
    emptyStateCopy: /登录后查看关注更新/i,
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
        emptyStateCopy: emptyStateCopy.source,
        items: [],
      }}
    />
  );

  expect(screen.getByRole("heading", { level: 2, name: title })).toBeDefined();
  expect(screen.getByText(description)).toBeDefined();
  expect(screen.getByText(emptyStateCopy)).toBeDefined();
});
