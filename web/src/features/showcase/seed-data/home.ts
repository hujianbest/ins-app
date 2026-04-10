import type { FeaturedPath, HomeHeroContent, HomePillar } from "../types";

export const homeHeroContent: HomeHeroContent = {
  label: "Editorial Discovery",
  title: "Lens Archive",
  description:
    "把作品、创作者与合作线索组织成一套本地化的首发测试基线。",
  primaryCta: {
    href: "/discover",
    label: "浏览发现流",
  },
  secondaryCta: {
    href: "/search?q=上海",
    label: "搜索城市与作品",
  },
};

export const homePageFeaturedPaths: FeaturedPath[] = [
  {
    href: "/photographers/sample-photographer",
    eyebrow: "摄影师",
    title: "夜色编辑人像与高对比品牌拍摄主线",
    description: "从城市夜景、黑白街头和 casting 测试一路延展到合作入口。",
  },
  {
    href: "/models/iris-luo",
    eyebrow: "模特",
    title: "以特写、妆面与封面构图组织的公开名片",
    description: "让 beauty、珠宝与 editorial 团队更快判断近景承载力。",
  },
  {
    href: "/opportunities",
    eyebrow: "合作",
    title: "覆盖多城市、多风格的公开合作诉求面板",
    description: "把 casting、lookbook、品牌 brief 和 beauty 合作放进同一入口。",
  },
];

export const homePagePillars: HomePillar[] = [
  {
    title: "本地素材包",
    description: "高质量图片和演示文案直接随仓库存放，便于测试、演示和首发预览。",
  },
  {
    title: "公开发现",
    description: "首页、发现、搜索、人物页和作品页共享同一组中规模内容基线。",
  },
  {
    title: "可持续扩容",
    description: "保留稳定 slug、作品 id 与图片映射，后续替换成自有素材时不必重做路由结构。",
  },
];
