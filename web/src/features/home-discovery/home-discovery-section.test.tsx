import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { HomeDiscoverySection } from "./home-discovery-section";

test.each([
  {
    kind: "featured" as const,
    title: "精选推荐",
    description: "优先展示社区精选作品与创作者。",
    emptyStateCopy: /精选内容整理中/i,
  },
  {
    kind: "latest" as const,
    title: "最新发布",
    description: "按最新公开发布时间浏览社区内容。",
    emptyStateCopy: /最新内容整理中/i,
  },
  {
    kind: "following" as const,
    title: "关注中",
    description: "关注创作者后，这里会显示他们的最新公开内容。",
    emptyStateCopy: /登录后查看关注中的创作者更新/i,
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
