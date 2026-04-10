import type {
  FeaturedPath,
  HomeHeroContent,
  HomePillar,
  PublicOpportunityPost,
  PublicProfile,
  PublicWork,
  SeedAssetRef,
  SeedVisualAsset,
} from "./types";

function buildPexelsAsset(
  id: SeedAssetRef,
  photoId: string,
  alt: string,
  sourceName: string,
  sourceUrl: string,
  orientation: "portrait" | "landscape" = "portrait",
): SeedVisualAsset {
  const size =
    orientation === "portrait"
      ? "w=1200&h=1500"
      : "w=1600&h=1066";

  return {
    id,
    imageUrl: `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&${size}&dpr=1`,
    alt,
    sourceName,
    sourceUrl,
    licenseLabel: "Pexels License",
  };
}

export const seedVisualAssets: Record<SeedAssetRef, SeedVisualAsset> = {
  "seed:avery-hero": buildPexelsAsset(
    "seed:avery-hero",
    "29817584",
    "夜色城市中的高对比编辑人像",
    "Alireza Heidarpour / Pexels",
    "https://www.pexels.com/photo/nighttime-urban-portrait-in-modern-city-29817584/",
  ),
  "seed:avery-bw-street": buildPexelsAsset(
    "seed:avery-bw-street",
    "35463532",
    "黑白街头时装感人像",
    "Jon Adams / Pexels",
    "https://www.pexels.com/photo/black-and-white-street-fashion-photography-35463532/",
    "landscape",
  ),
  "seed:avery-studio-casting": buildPexelsAsset(
    "seed:avery-studio-casting",
    "2915216",
    "具有植物肌理与高反差质感的时尚肖像",
    "Marlon Schmeiski / Pexels",
    "https://www.pexels.com/photo/2915216/",
  ),
  "seed:mika-hero": buildPexelsAsset(
    "seed:mika-hero",
    "36378240",
    "影棚中的专业模特肖像",
    "From Salih / Pexels",
    "https://www.pexels.com/photo/portrait-of-woman-in-professional-studio-setting-36378240/",
  ),
  "seed:mika-soft-light": buildPexelsAsset(
    "seed:mika-soft-light",
    "2723623",
    "柔和材质与安静姿态构成的时装肖像",
    "Barathan Amuthan / Pexels",
    "https://www.pexels.com/photo/2723623/",
  ),
  "seed:mika-lookbook": buildPexelsAsset(
    "seed:mika-lookbook",
    "4006513",
    "带有墨镜与缎面手套的编辑时装肖像",
    "Arianna Jade / Pexels",
    "https://www.pexels.com/photo/4006513/",
  ),
};

export const seedContentDisclosure =
  "首发种子视觉使用 Pexels 授权图片，人物资料、合作摘要与作品文案为虚构演示内容；正式商用前应迁移到自有对象存储并复核每条来源页。";

export const seedContentSourceManifest = Object.values(seedVisualAssets);

export function resolveSeedVisualAsset(assetRef?: SeedAssetRef) {
  if (!assetRef) {
    return null;
  }

  if (assetRef.startsWith("http://") || assetRef.startsWith("https://")) {
    return {
      id: assetRef,
      imageUrl: assetRef,
      alt: "外部视觉资源",
      sourceName: "External asset",
      sourceUrl: assetRef,
      licenseLabel: "External license",
    } satisfies SeedVisualAsset;
  }

  return seedVisualAssets[assetRef] ?? null;
}

export const homeHeroContent: HomeHeroContent = {
  label: "Editorial Discovery",
  title: "Lens Archive",
  description:
    "把高质量作品浏览、创作者关系和合作线索收成同一条公开叙事，让首页不只是项目演示，而是具备正式首发气质的内容入口。",
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
    description:
      "用连贯的公开主页承接代表作、关注关系和可直接转化的合作入口。",
  },
  {
    href: "/models/sample-model",
    eyebrow: "模特",
    title: "面向品牌 lookbook 与美妆内容的公开名片",
    description:
      "把镜头表现、风格稳定性和合作方向整合为一条成熟的对外展示路径。",
  },
  {
    href: "/opportunities",
    eyebrow: "合作",
    title: "可直接浏览的招募与合作需求列表",
    description:
      "让城市、档期与拍摄方向清晰可见，把灵感浏览自然延伸为正式接洽。",
  },
];

export const homePagePillars: HomePillar[] = [
  {
    title: "首屏叙事",
    description:
      "以更成熟的杂志式文案和视觉种子拉起首页情绪，不再停留在工程样片感。",
  },
  {
    title: "公开发现",
    description:
      "作品、创作者与合作内容共享同一发现路径，支持首页、发现与搜索之间的连续浏览。",
  },
  {
    title: "来源可追溯",
    description:
      "保留授权图片来源说明，并明确当前资料为虚构演示内容，避免将未知版权素材混入基线。",
  },
];

export const photographerProfiles: PublicProfile[] = [
  {
    slug: "sample-photographer",
    role: "photographer",
    name: "Avery Vale",
    city: "上海",
    publishedAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-06T09:30:00Z",
    tagline: "专注夜色编辑人像与品牌情绪片的摄影师，擅长在城市空间里拉出高反差叙事。",
    bio: "Avery 以夜色、霓虹、镜面反光和克制动作建立识别度，常见合作方向包括品牌前导、编辑人像、casting 测试和高辨识度 campaign 视觉样片。",
    contactLabel: "联系摄影师",
    sectionTitle: "精选画面",
    sectionDescription: "围绕夜色城市、黑白街头与 casting 测试整理出的三组首发作品，用于承接品牌合作和公开浏览。",
    heroImageLabel: "摄影师封面视觉",
    heroAsset: "seed:avery-hero",
    showcaseItems: [
      {
        workId: "neon-portrait-study",
        title: "霓虹人像研究",
        subtitle: "编辑人像",
        description: "用夜间城市光源和高对比肤色控制建立编辑感的首发样片，用于展示品牌情绪和镜头调度能力。",
        coverAsset: "seed:avery-hero",
      },
      {
        workId: "monochrome-street-session",
        title: "黑白街头片段",
        subtitle: "个人系列",
        description: "一组黑白街头样片，强调步态、轮廓和空间留白，让品牌团队快速判断影像气质与人物控制力。",
        coverAsset: "seed:avery-bw-street",
      },
      {
        workId: "studio-motion-casting",
        title: "影棚动态试镜",
        subtitle: "画册导拍",
        description: "以更贴近 casting 场景的动态测试展示动作连接、服装质感和镜头中的情绪延续能力。",
        coverAsset: "seed:avery-studio-casting",
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
    updatedAt: "2026-04-06T08:15:00Z",
    tagline: "偏编辑与品牌形象方向的模特，镜头反馈稳定，适合美妆、lookbook 与概念外景拍摄。",
    bio: "Mika 的公开资料围绕稳定表情控制、服装轮廓表达与近景美妆承载力组织，适合需要成熟镜头感、服装辨识度和轻戏剧化情绪的拍摄合作。",
    contactLabel: "联系模特",
    sectionTitle: "编辑精选",
    sectionDescription: "首发基线以柔光美妆、时装 lookbook 与暮色外景三种公开场景构成，覆盖品牌最常见的试拍方向。",
    heroImageLabel: "模特封面视觉",
    heroAsset: "seed:mika-hero",
    showcaseItems: [
      {
        workId: "soft-light-editorial",
        title: "柔光编辑片",
        subtitle: "美妆片",
        description: "围绕肤质、眼神和柔光近景组织的一组美妆样片，用于展示干净妆面和稳定镜头承载力。",
        coverAsset: "seed:mika-soft-light",
      },
      {
        workId: "gallery-white-lookbook",
        title: "白廊样片册",
        subtitle: "商业形象",
        description: "强调服装轮廓、肢体延展和品牌 lookbook 节奏的公开样片，适合作为商业试拍基准。",
        coverAsset: "seed:mika-lookbook",
      },
      {
        workId: "twilight-exterior-story",
        title: "暮色外景叙事",
        subtitle: "概念人像",
        description: "将安静姿态、城市暮色与轻叙事调度结合起来，展示外景合作中更完整的角色气质。",
        coverAsset: "seed:avery-hero",
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

export function getProfileHeroAssetRef(
  role: "photographer" | "model",
  slug: string,
) {
  const profile =
    role === "photographer"
      ? getPhotographerProfileBySlug(slug)
      : getModelProfileBySlug(slug);

  return profile?.heroAsset ?? profile?.showcaseItems[0]?.coverAsset;
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
      "以夜色城市光源、镜面反射和强轮廓对比建立情绪强烈的编辑人像，用来充当首页与公开主页的首发主视觉。",
    detailNote: "这组作品把合作方最关心的三件事放在同一页里说明白：控光、色彩判断和在复杂城市环境中的人物调度能力。",
    contactLabel: "联系摄影师",
    coverAsset: "seed:avery-hero",
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
      "围绕步态、街景和服装轮廓建立的黑白街头系列，用更克制的色彩策略强调动作与构图本身。",
    detailNote: "它不是单纯的氛围图，而是一组方便品牌方快速判断叙事节奏、人物张力与版面适配度的公开系列。",
    contactLabel: "联系摄影师",
    coverAsset: "seed:avery-bw-street",
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
      "用接近 casting 的调度与动作连接方式呈现服装材质、表情张力和动态镜头节奏，让客户更快感知执行能力。",
    detailNote: "这组内容被设计成品牌前导参考：在更少布景信息里验证人物与镜头的连接是否足够稳定、是否适合进入正式 campaign 拍摄。",
    contactLabel: "联系摄影师",
    coverAsset: "seed:avery-studio-casting",
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
      "强调近景质感、目光稳定性与柔和肌理的一组美妆向样片，适合作为品牌 beauty shoot 的首轮沟通样本。",
    detailNote: "这组图的重点不是戏剧化造型，而是让团队能快速判断面部线条、妆面承载与镜头前的停顿感是否足够成熟。",
    contactLabel: "联系模特",
    coverAsset: "seed:mika-soft-light",
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
      "围绕服装轮廓、转身动作与品牌 lookbook 节奏组织的一组公开样片，用于说明商业拍摄中的稳定交付能力。",
    detailNote: "白廊语境让服装、身体线条与面部反馈保持清晰，也使这组内容适合直接作为品牌选角与前测参考。",
    contactLabel: "联系模特",
    coverAsset: "seed:mika-lookbook",
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
      "把城市暮色、安静姿态和角色化视线组织成可公开浏览的外景概念内容，用来展示更完整的情绪表演能力。",
    detailNote: "这组作品更偏向氛围叙事，但仍保留足够清晰的动作和服装信息，便于合作方判断外景沟通与情绪稳定性。",
    contactLabel: "联系模特",
    coverAsset: "seed:avery-hero",
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
    title: "上海夜景编辑拍摄招募",
    city: "上海",
    schedule: "2026-04-20 晚间",
    summary:
      "寻找能够适应夜间街景调度、服装轮廓表达和较强镜头情绪的模特，共同完成一组编辑风格 campaign 前测。",
    contactLabel: "联系摄影师",
    coverAsset: "seed:avery-hero",
  },
  {
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
    contactLabel: "联系模特",
    coverAsset: "seed:mika-soft-light",
  },
];

export function getOpportunityPostById(postId: string) {
  return opportunityPosts.find((post) => post.id === postId);
}

export function getOpportunityPostsByRole(role: "photographer" | "model") {
  return opportunityPosts.filter((post) => post.ownerRole === role);
}
