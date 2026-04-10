import type { PublicOpportunityPost } from "../types";

import { buildOpportunityPost } from "./shared";

export const opportunityPosts: PublicOpportunityPost[] = [
  buildOpportunityPost({
    id: "shanghai-editorial-casting",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-04-03T08:00:00Z",
    updatedAt: "2026-04-05T07:30:00Z",
    title: "上海夜景编辑拍摄招募",
    city: "上海",
    schedule: "2026-04-20 晚间",
    summary:
      "寻找能够适应夜间街景调度、服装轮廓表达和较强镜头情绪的模特，共同完成一组编辑风格 campaign 前测。",
    coverAsset: "seed:night-editorial-brief",
  }),
  buildOpportunityPost({
    id: "hangzhou-beauty-collab",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-04-02T08:30:00Z",
    title: "杭州柔光美妆合作邀约",
    city: "杭州",
    schedule: "2026-04-27 下午",
    summary:
      "寻找摄影师合作完成一组以柔光、近景质感和品牌 beauty board 为核心的美妆样片，优先有商业 lookbook 经验者。",
    coverAsset: "seed:beauty-collab-brief",
  }),
  buildOpportunityPost({
    id: "suzhou-campaign-prelight",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-04-01T07:45:00Z",
    title: "苏州夜景 campaign 预光测试",
    city: "苏州",
    schedule: "2026-05-03 晚间",
    summary:
      "寻找能适应夜景通勤感和高对比控光的模特，先完成一轮预光测试和 mood 对齐。",
    coverAsset: "seed:editorial-shoot-brief",
  }),
  buildOpportunityPost({
    id: "shanghai-lookbook-fitting",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-03-31T08:10:00Z",
    title: "上海春季 lookbook 试衣合作",
    city: "上海",
    schedule: "2026-04-30 上午",
    summary:
      "寻找摄影师和造型团队完成一组白廊与极简空间结合的 lookbook 试拍，优先偏 clean commercial 语言。",
    coverAsset: "seed:editorial-beauty-brief",
  }),
  buildOpportunityPost({
    id: "beijing-concrete-lookbook",
    ownerSlug: "elio-ren",
    ownerRole: "photographer",
    ownerName: "Elio Ren",
    publishedAt: "2026-03-30T09:40:00Z",
    title: "北京建筑感 lookbook 合作招募",
    city: "北京",
    schedule: "2026-05-02 上午",
    summary:
      "寻找适合低饱和建筑语境和直线构图的模特，完成一组更偏品牌静态展示的 lookbook。",
    coverAsset: "seed:elio-concrete-lookbook",
  }),
  buildOpportunityPost({
    id: "shenzhen-brand-prelight",
    ownerSlug: "elio-ren",
    ownerRole: "photographer",
    ownerName: "Elio Ren",
    publishedAt: "2026-03-27T09:20:00Z",
    title: "深圳品牌前导预排期",
    city: "深圳",
    schedule: "2026-05-06 下午",
    summary:
      "寻找对极简棚拍和建筑外景都适应的模特，先完成一轮前导试拍和服装方向确认。",
    coverAsset: "seed:editorial-shoot-brief",
  }),
  buildOpportunityPost({
    id: "shenzhen-monochrome-campaign",
    ownerSlug: "noa-santoro",
    ownerRole: "photographer",
    ownerName: "Noa Santoro",
    publishedAt: "2026-03-29T07:30:00Z",
    title: "深圳黑白时装 campaign 预拍",
    city: "深圳",
    schedule: "2026-05-05 晚间",
    summary:
      "寻找肢体干净、能快速进入黑白版型语言的模特，用于时装线 campaign 方向预拍。",
    coverAsset: "seed:noa-monochrome-portrait",
  }),
  buildOpportunityPost({
    id: "guangzhou-rooftop-brief",
    ownerSlug: "noa-santoro",
    ownerRole: "photographer",
    ownerName: "Noa Santoro",
    publishedAt: "2026-03-25T07:20:00Z",
    title: "广州屋顶 brief 测试拍摄",
    city: "广州",
    schedule: "2026-04-29 傍晚",
    summary:
      "寻找能处理风感和快速动作切换的模特，先完成一轮 rooftop 版型与动作测试。",
    coverAsset: "seed:night-editorial-brief",
  }),
  buildOpportunityPost({
    id: "beijing-beauty-closeup",
    ownerSlug: "iris-luo",
    ownerRole: "model",
    ownerName: "Iris Luo",
    publishedAt: "2026-03-28T10:40:00Z",
    title: "北京 beauty close-up 合作邀约",
    city: "北京",
    schedule: "2026-05-04 下午",
    summary:
      "寻找擅长近景妆面和珠宝反光控制的摄影师，共同完成一组封面级 beauty close-up 样片。",
    coverAsset: "seed:iris-hero",
  }),
  buildOpportunityPost({
    id: "hangzhou-editorial-makeup-day",
    ownerSlug: "iris-luo",
    ownerRole: "model",
    ownerName: "Iris Luo",
    publishedAt: "2026-03-24T10:10:00Z",
    title: "杭州 editorial 妆面日拍",
    city: "杭州",
    schedule: "2026-04-28 上午",
    summary:
      "寻找对彩妆、珠宝和布景细节有经验的摄影师团队，完成一组更偏杂志风格的日拍样片。",
    coverAsset: "seed:beauty-collab-brief",
  }),
  buildOpportunityPost({
    id: "guangzhou-street-luxe-casting",
    ownerSlug: "sora-lin",
    ownerRole: "model",
    ownerName: "Sora Lin",
    publishedAt: "2026-03-23T11:20:00Z",
    title: "广州街头奢感 casting 合作",
    city: "广州",
    schedule: "2026-04-26 晚间",
    summary:
      "寻找擅长城市街头、外套轮廓和墨镜氛围的摄影师，完成一组更偏 street luxe 的 casting 样片。",
    coverAsset: "seed:sunglasses-street-brief",
  }),
  buildOpportunityPost({
    id: "shanghai-sunglasses-campaign",
    ownerSlug: "sora-lin",
    ownerRole: "model",
    ownerName: "Sora Lin",
    publishedAt: "2026-03-20T11:10:00Z",
    title: "上海墨镜 campaign 提案合作",
    city: "上海",
    schedule: "2026-05-01 下午",
    summary:
      "寻找能把都市通勤感和更强品牌态度结合起来的摄影师，先做一轮墨镜和外套方向提案拍摄。",
    coverAsset: "seed:sora-hero",
  }),
];

export function getOpportunityPostById(postId: string) {
  return opportunityPosts.find((post) => post.id === postId);
}

export function getOpportunityPostsByRole(role: "photographer" | "model") {
  return opportunityPosts.filter((post) => post.ownerRole === role);
}
