// @vitest-environment node
import { describe, expect, it } from "vitest";

import { buildContextSourceLink } from "./context-link";

describe("messaging/context-link > buildContextSourceLink", () => {
  it("returns 直接对话 when contextRef is undefined", () => {
    expect(buildContextSourceLink(undefined)).toEqual({ label: "直接对话" });
  });

  it("maps work:<id> to /works/<id>", () => {
    expect(buildContextSourceLink("work:work-123")).toEqual({
      label: "来自作品 #work-123",
      href: "/works/work-123",
    });
  });

  it("maps profile:photographer:<slug> to /photographers/<slug> with 摄影师 label", () => {
    expect(buildContextSourceLink("profile:photographer:avery")).toEqual({
      label: "来自摄影师主页 #avery",
      href: "/photographers/avery",
    });
  });

  it("maps profile:model:<slug> to /models/<slug> with 模特 label", () => {
    expect(buildContextSourceLink("profile:model:jules")).toEqual({
      label: "来自模特主页 #jules",
      href: "/models/jules",
    });
  });

  it("maps opportunity:<id> to /opportunities/<id>", () => {
    expect(buildContextSourceLink("opportunity:post-7")).toEqual({
      label: "来自合作诉求 #post-7",
      href: "/opportunities/post-7",
    });
  });
});
