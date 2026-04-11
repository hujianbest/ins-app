import { describe, expect, it } from "vitest";

import { createSqliteCommunityRepositoryBundle } from "@/features/community/sqlite";

import { searchCatalog } from "./search";

describe("searchCatalog", () => {
  const bundle = createSqliteCommunityRepositoryBundle({
    databasePath: ":memory:",
  });

  it("returns profile, work, and opportunity matches", async () => {
    const results = await searchCatalog("上海", bundle);
    const opportunityMatch = results.opportunities.find((item) =>
      item.href.includes("/opportunities/"),
    );

    expect(results.profiles.some((item) => item.title === "Avery Vale")).toBe(
      true,
    );
    expect(opportunityMatch).toMatchObject({
      badge: "摄影师诉求",
      meta: "Avery Vale",
      visualDescription: "上海 · 2026-04-20 晚间",
    });
    expect(results.total).toBeGreaterThan(1);
  });

  it("returns work matches for category or owner keywords", async () => {
    const results = await searchCatalog("编辑人像", bundle);
    const matchedWork = results.works.find((item) => item.title === "霓虹人像研究");

    expect(matchedWork).toBeDefined();
    expect(matchedWork?.assetRef).toBe("seed:avery-hero");
    expect(matchedWork?.meta).toContain("上海");
    expect(matchedWork?.meta).toContain("夜色编辑人像与品牌情绪片");
  });

  it("matches creator discovery context and focus in both profile and work results", async () => {
    const results = await searchCatalog("长期合作模特", bundle);
    const profileMatch = results.profiles.find((item) => item.title === "Avery Vale");
    const workMatch = results.works.find((item) => item.title === "霓虹人像研究");

    expect(profileMatch).toMatchObject({
      meta: "上海 · 夜色编辑人像与品牌情绪片",
      description:
        "希望被上海品牌团队、长期合作模特与 editorial collaborator 反复看到",
    });
    expect(workMatch).toBeDefined();
  });

  it("returns empty results for blank queries", async () => {
    const results = await searchCatalog("   ", bundle);

    expect(results.total).toBe(0);
    expect(results.works).toEqual([]);
    expect(results.profiles).toEqual([]);
    expect(results.opportunities).toEqual([]);
  });
});
