import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { HomeDiscoverySection } from "./home-discovery-section";

test.each([
  {
    kind: "works" as const,
    title: "精选作品",
    description: "从社区最新作品里挑出的优先浏览内容。",
    emptyStateCopy: /更多作品精选即将上线/i,
  },
  {
    kind: "profiles" as const,
    title: "精选主页",
    description: "认识准备开启合作的摄影师与模特。",
    emptyStateCopy: /更多主页精选即将上线/i,
  },
  {
    kind: "opportunities" as const,
    title: "精选诉求",
    description: "浏览最新发布的约拍诉求与合作请求。",
    emptyStateCopy: /更多约拍诉求即将上线/i,
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
