import type {
  FeaturedPath,
  HomeHeroContent,
  HomePillar,
  PublicOpportunityPost,
  PublicProfile,
  PublicWork,
} from "./types";

export const homeHeroContent: HomeHeroContent = {
  label: "沉浸式视觉首屏",
  title: "Lens Archive",
  description:
    "为摄影师与模特打造的精致展示空间，用来呈现代表作品、发布约拍诉求，并把关注转化为真实联系。",
  primaryCta: {
    href: "/photographers/sample-photographer",
    label: "浏览摄影师主页",
  },
  secondaryCta: {
    href: "/opportunities",
    label: "查看在约诉求",
  },
};

export const homePageFeaturedPaths: FeaturedPath[] = [
  {
    href: "/photographers/sample-photographer",
    eyebrow: "摄影师",
    title: "适合商业合作的沉浸式作品主页",
    description:
      "把访客从电影感首页引导到代表作品、风格说明与明确的合作入口。",
  },
  {
    href: "/models/sample-model",
    eyebrow: "模特",
    title: "兼具编辑感与辨识度的人才主页",
    description:
      "用清爽的画廊式布局呈现气质、形象与镜头表现，建立第一印象。",
  },
  {
    href: "/opportunities",
    eyebrow: "诉求",
    title: "面向摄影师与模特的公开合作招募",
    description:
      "集中展示城市与档期相关的合作需求，让公开入口直接转化为协作起点。",
  },
];

export const homePagePillars: HomePillar[] = [
  {
    title: "展示",
    description:
      "以 Hero 为核心的落地页体验，保留舒展构图、强对比和画廊优先的浏览层级。",
  },
  {
    title: "互动",
    description:
      "让访客从内容发现自然进入点赞、收藏与站内私信联系。",
  },
  {
    title: "约拍",
    description:
      "把公开主页与城市、档期诉求连接起来，让兴趣更容易转化为正式合作。",
  },
];

export const photographerProfiles: PublicProfile[] = [
  {
    slug: "sample-photographer",
    role: "photographer",
    name: "Avery Vale",
    city: "上海",
    publishedAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-04T09:30:00Z",
    tagline: "擅长时尚与人像拍摄的摄影师，专注打造电影感合作项目。",
    bio: "Avery 擅长用高对比和明确情绪构建人像叙事，适用于编辑拍摄、个人品牌和合作约拍场景。",
    contactLabel: "联系摄影师",
    sectionTitle: "精选画面",
    sectionDescription: "从代表作品中挑出最能体现情绪、控光与人像表现力的一组精选画面。",
    heroImageLabel: "摄影师封面视觉",
    showcaseItems: [
      {
        workId: "neon-portrait-study",
        title: "霓虹人像研究",
        subtitle: "编辑人像",
        description: "一组以青色高光与浓重阴影平衡的低调人像，用来建立强烈的合作第一印象。",
      },
      {
        workId: "monochrome-street-session",
        title: "黑白街头片段",
        subtitle: "个人系列",
        description: "一组克制的黑白街头作品，聚焦动作、姿态与城市质感的表达。",
      },
      {
        workId: "studio-motion-casting",
        title: "影棚动态试镜",
        subtitle: "画册导拍",
        description: "一组干净的影棚动态序列，用来展示即使在动作中也能保持高级与克制的画面调性。",
      },
    ],
  },
];

export const modelProfiles: PublicProfile[] = [
  {
    slug: "sample-model",
    role: "model",
    name: "Mika Rowan",
    city: "杭州",
    publishedAt: "2026-04-02T10:00:00Z",
    updatedAt: "2026-04-05T08:15:00Z",
    tagline: "具备编辑感与镜头表现力的模特，风格克制、稳定且上镜。",
    bio: "Mika 以简洁、时尚导向的方式呈现个人形象，适合人像拍摄、商业 mood board 与概念拍摄合作。",
    contactLabel: "联系模特",
    sectionTitle: "编辑精选",
    sectionDescription: "一组用于展示造型范围、姿态控制与情绪化镜头承载力的精选内容。",
    heroImageLabel: "模特封面视觉",
    showcaseItems: [
      {
        workId: "soft-light-editorial",
        title: "柔光编辑片",
        subtitle: "美妆片",
        description: "一组安静的近景人像，以肤质、眼神控制和克制造型呈现柔和的美妆气质。",
      },
      {
        workId: "gallery-white-lookbook",
        title: "白廊样片册",
        subtitle: "商业形象",
        description: "一组明亮的 lookbook 序列，突出轮廓、动作与稳定的镜头表现。",
      },
      {
        workId: "twilight-exterior-story",
        title: "暮色外景叙事",
        subtitle: "概念人像",
        description: "一组融合城市暮色、安静姿态与线条表达的外景概念人像。",
      },
    ],
  },
];

export function getPhotographerProfileBySlug(slug: string) {
  return photographerProfiles.find((profile) => profile.slug === slug);
}

export function getModelProfileBySlug(slug: string) {
  return modelProfiles.find((profile) => profile.slug === slug);
}

export function getProfileByRole(role: "photographer" | "model") {
  return role === "photographer" ? photographerProfiles[0] : modelProfiles[0];
}

export const works: PublicWork[] = [
  {
    id: "neon-portrait-study",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-04-05T09:00:00Z",
    updatedAt: "2026-04-05T18:00:00Z",
    title: "霓虹人像研究",
    category: "编辑人像",
    description:
      "一组以青色高光与浓重阴影平衡的低调人像，用来建立强烈的合作第一印象。",
    detailNote: "这组作品适合用于艺术指导沟通，重点体现强控光能力与一眼可见的视觉自信。",
    contactLabel: "联系摄影师",
  },
  {
    id: "monochrome-street-session",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-03-30T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
    title: "黑白街头片段",
    category: "个人系列",
    description:
      "一组克制的黑白街头作品，聚焦动作、姿态与城市质感的表达。",
    detailNote: "这组内容用来展示纪实感与动作控制能力，同时保留人像合作所需的高级取景表达。",
    contactLabel: "联系摄影师",
  },
  {
    id: "studio-motion-casting",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-03-25T09:00:00Z",
    title: "影棚动态试镜",
    category: "画册导拍",
    description:
      "一组干净的影棚动态序列，用来展示即使在动作中也能保持高级与克制的画面调性。",
    detailNote: "这组作品可作为高辨识度的画册参考，把动作表现与克制构图结合到品牌导向拍摄中。",
    contactLabel: "联系摄影师",
  },
  {
    id: "soft-light-editorial",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-04-04T11:00:00Z",
    updatedAt: "2026-04-05T13:00:00Z",
    title: "柔光编辑片",
    category: "美妆片",
    description:
      "一组安静的近景人像，以肤质、眼神控制和克制造型呈现柔和的美妆气质。",
    detailNote: "这组内容以平静姿态和稳定近景表现呈现美妆导向的 mood board 参考。",
    contactLabel: "联系模特",
  },
  {
    id: "gallery-white-lookbook",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-03-28T10:00:00Z",
    title: "白廊样片册",
    category: "商业形象",
    description:
      "一组明亮的 lookbook 序列，突出轮廓、动作与稳定的镜头表现。",
    detailNote: "这组样片强调稳定、清晰和对造型变化的适配力，适合商业合作场景。",
    contactLabel: "联系模特",
  },
  {
    id: "twilight-exterior-story",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-03-21T10:00:00Z",
    title: "暮色外景叙事",
    category: "概念人像",
    description:
      "一组融合城市暮色、安静姿态与线条表达的外景概念人像。",
    detailNote: "这组外景作品用来展示情绪主导的拍摄节奏，让姿态、节律与环境光都清晰可读。",
    contactLabel: "联系模特",
  },
];

export function getWorkById(workId: string) {
  return works.find((work) => work.id === workId);
}

export function getWorksByRole(role: "photographer" | "model") {
  return works.filter((work) => work.ownerRole === role);
}

export const opportunityPosts: PublicOpportunityPost[] = [
  {
    id: "shanghai-editorial-casting",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-04-03T08:00:00Z",
    updatedAt: "2026-04-05T07:30:00Z",
    title: "上海编辑拍摄招募",
    city: "上海",
    schedule: "2026-04-20 晚间",
    summary:
      "寻找能适应电影感人像调度、强造型对比和上海市中心快节奏编辑拍摄的模特。",
    contactLabel: "联系摄影师",
  },
  {
    id: "hangzhou-beauty-collab",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-04-02T08:30:00Z",
    title: "杭州美妆合作邀约",
    city: "杭州",
    schedule: "2026-04-27 下午",
    summary:
      "寻找摄影师合作完成一组以柔光、克制造型和精致近景为核心的美妆向拍摄。",
    contactLabel: "联系模特",
  },
];

export function getOpportunityPostById(postId: string) {
  return opportunityPosts.find((post) => post.id === postId);
}

export function getOpportunityPostsByRole(role: "photographer" | "model") {
  return opportunityPosts.filter((post) => post.ownerRole === role);
}
