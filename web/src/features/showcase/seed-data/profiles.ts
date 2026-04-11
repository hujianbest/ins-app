import type { PublicProfile } from "../types";

export const photographerProfiles: PublicProfile[] = [
  {
    slug: "sample-photographer",
    role: "photographer",
    name: "Avery Vale",
    city: "上海",
    shootingFocus: "夜色编辑人像与品牌情绪片",
    discoveryContext:
      "希望被上海品牌团队、长期合作模特与 editorial collaborator 反复看到",
    externalHandoffUrl: "https://portfolio.example.com/avery",
    publishedAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-09T11:00:00Z",
    tagline:
      "专注夜色编辑人像与品牌情绪片的摄影师，擅长在城市空间里拉出高对比叙事。",
    bio: "Avery 常拍品牌前导、编辑人像和 casting 测试，画面偏夜色、霓虹、镜面反光和克制动作，适合需要强情绪但仍保持商业清晰度的品牌团队。",
    contactLabel: "联系摄影师",
    sectionTitle: "精选画面",
    sectionDescription:
      "围绕夜景主视觉、黑白街头、影棚动态和站台 brief 整理出的四组公开作品，用于承接首发展示与合作筛选。",
    heroImageLabel: "摄影师封面视觉",
    heroAsset: "seed:avery-hero",
    showcaseItems: [
      {
        workId: "neon-portrait-study",
        title: "霓虹人像研究",
        subtitle: "编辑人像",
        description: "夜景编辑人像样片，突出控光、色彩判断与人物调度。",
        coverAsset: "seed:avery-hero",
      },
      {
        workId: "monochrome-street-session",
        title: "黑白街头片段",
        subtitle: "个人系列",
        description: "以步态、轮廓和留白组织出的黑白街头叙事。",
        coverAsset: "seed:avery-bw-street",
      },
      {
        workId: "studio-motion-casting",
        title: "影棚动态试镜",
        subtitle: "画册导拍",
        description: "影棚动态测试，强调动作连接和服装质感。",
        coverAsset: "seed:avery-studio-casting",
      },
      {
        workId: "rain-platform-editorial",
        title: "雨站台前导片",
        subtitle: "品牌 brief",
        description: "更贴近 campaign 前测语境的一组雨夜人像。",
        coverAsset: "seed:night-editorial-brief",
      },
    ],
  },
  {
    slug: "elio-ren",
    role: "photographer",
    name: "Elio Ren",
    city: "北京",
    shootingFocus: "建筑感 lookbook 与冷调商业 portrait",
    discoveryContext:
      "希望被北京服装品牌团队与需要 clean visual language 的创意制片看到",
    externalHandoffUrl: "https://portfolio.example.com/elio",
    publishedAt: "2026-04-03T09:00:00Z",
    updatedAt: "2026-04-07T10:20:00Z",
    tagline:
      "偏低饱和建筑感叙事的摄影师，擅长把混凝土、玻璃与服装结构拉成统一节奏。",
    bio: "Elio 的公开资料围绕 lookbook、空间感较强的 portraits 和极简影棚拍摄展开，风格偏冷静、留白和直线构图，适合需要 clean visual language 的商业团队。",
    contactLabel: "联系摄影师",
    sectionTitle: "精选画面",
    sectionDescription:
      "以建筑清晨、混凝土 lookbook、极简影棚和 casting board 四个方向组织的公开作品集。",
    heroImageLabel: "摄影师封面视觉",
    heroAsset: "seed:elio-hero",
    showcaseItems: [
      {
        workId: "concrete-daybreak-portfolio",
        title: "清晨建筑光",
        subtitle: "品牌前导",
        description: "用建筑阴影和低饱和色彩组织的签名式开场作品。",
        coverAsset: "seed:elio-hero",
      },
      {
        workId: "concrete-lookbook-series",
        title: "混凝土 lookbook",
        subtitle: "商业形象",
        description: "围绕直线、面料和城市肌理展开的 lookbook 拍摄。",
        coverAsset: "seed:elio-concrete-lookbook",
      },
      {
        workId: "minimal-studio-notes",
        title: "极简影棚札记",
        subtitle: "人物研究",
        description: "减少道具信息后，直接观察视线、姿态和衣料反应。",
        coverAsset: "seed:elio-minimal-studio",
      },
      {
        workId: "winter-casting-board",
        title: "冬日 casting board",
        subtitle: "试拍提案",
        description: "为品牌内审整理的一组人物和服装方向提案。",
        coverAsset: "seed:editorial-shoot-brief",
      },
    ],
  },
  {
    slug: "noa-santoro",
    role: "photographer",
    name: "Noa Santoro",
    city: "深圳",
    shootingFocus: "黑白品牌片与动势 editorial",
    discoveryContext:
      "希望被深圳品牌团队、campaign casting 合作者与高识别度模特看到",
    externalHandoffUrl: "https://portfolio.example.com/noa",
    publishedAt: "2026-04-04T08:30:00Z",
    updatedAt: "2026-04-06T12:10:00Z",
    tagline:
      "偏黑白剪影与动势品牌片方向的摄影师，擅长把人物动作和服装版型一起推到前景。",
    bio: "Noa 的拍摄路线更靠近品牌 campaign、运动感 editorial 和 rooftop brief，画面强调黑白反差、风感、转身动作和高识别度的版型关系。",
    contactLabel: "联系摄影师",
    sectionTitle: "精选画面",
    sectionDescription:
      "以海边主视觉、黑白版型、深夜 campaign 与屋顶测试四条线整理出的品牌感作品集。",
    heroImageLabel: "摄影师封面视觉",
    heroAsset: "seed:noa-hero",
    showcaseItems: [
      {
        workId: "coastal-silhouette-campaign",
        title: "海风剪影 campaign",
        subtitle: "品牌前导",
        description: "以大幅布料、逆风和侧身轮廓建立的主视觉。",
        coverAsset: "seed:noa-hero",
      },
      {
        workId: "monochrome-tailoring-study",
        title: "黑白版型研究",
        subtitle: "时装系列",
        description: "把版型、站姿和高对比布光压到同一张图里。",
        coverAsset: "seed:noa-monochrome-portrait",
      },
      {
        workId: "after-hours-campaign",
        title: "深夜 campaign 提案",
        subtitle: "商业测试",
        description: "更接近品牌 brief 的城市漫游拍摄方案。",
        coverAsset: "seed:berlin-campaign-brief",
      },
      {
        workId: "rooftop-shadow-tests",
        title: "屋顶阴影测试",
        subtitle: "casting 测试",
        description: "在高处风感和阴影里测试动作连贯与服装响应。",
        coverAsset: "seed:night-editorial-brief",
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
    shootingFocus: "编辑与品牌形象",
    discoveryContext: "希望被杭州及周边的摄影师与品牌样片团队看到",
    externalHandoffUrl: "https://portfolio.example.com/mika",
    publishedAt: "2026-04-02T10:00:00Z",
    updatedAt: "2026-04-08T14:00:00Z",
    tagline:
      "偏编辑与品牌形象方向的模特，镜头反馈稳定，适合美妆、lookbook 与概念外景拍摄。",
    bio: "Mika 的公开资料围绕稳定表情控制、服装轮廓表达与近景美妆承载力组织，适合需要成熟镜头感、服装辨识度和轻戏剧化情绪的品牌拍摄。",
    contactLabel: "联系模特",
    sectionTitle: "编辑精选",
    sectionDescription:
      "以柔光美妆、白廊 lookbook、暮色外景和签名式封面肖像四组内容构成首发基线。",
    heroImageLabel: "模特封面视觉",
    heroAsset: "seed:mika-hero",
    showcaseItems: [
      {
        workId: "soft-light-editorial",
        title: "柔光编辑片",
        subtitle: "美妆片",
        description: "围绕肤质、眼神和柔光近景组织的一组美妆样片。",
        coverAsset: "seed:mika-soft-light",
      },
      {
        workId: "gallery-white-lookbook",
        title: "白廊样片册",
        subtitle: "商业形象",
        description: "强调服装轮廓、转身动作与品牌节奏的公开样片。",
        coverAsset: "seed:mika-lookbook",
      },
      {
        workId: "twilight-exterior-story",
        title: "暮色外景叙事",
        subtitle: "概念人像",
        description: "把安静姿态、城市空气和轻戏剧感揉在一起。",
        coverAsset: "seed:editorial-beauty-brief",
      },
      {
        workId: "portrait-light-signature",
        title: "签名感柔光肖像",
        subtitle: "主页视觉",
        description: "更靠近封面和形象主视觉的一组标志性肖像。",
        coverAsset: "seed:mika-hero",
      },
    ],
  },
  {
    slug: "iris-luo",
    role: "model",
    name: "Iris Luo",
    city: "北京",
    shootingFocus: "美妆近景与封面肖像",
    discoveryContext:
      "希望被北京 beauty 摄影师、彩妆团队与杂志近景项目看到",
    externalHandoffUrl: "https://portfolio.example.com/iris",
    publishedAt: "2026-04-03T11:00:00Z",
    updatedAt: "2026-04-05T16:20:00Z",
    tagline:
      "偏美妆近景与封面构图方向的模特，擅长稳定承载珠宝、眼妆与肤质表现。",
    bio: "Iris 的公开内容围绕特写控制、情绪停顿和商业 beauty board 组织，适合需要高完成度近景表现的杂志、彩妆与首饰拍摄。",
    contactLabel: "联系模特",
    sectionTitle: "编辑精选",
    sectionDescription:
      "从主视觉近景、黑白皮肤研究、彩色 editorial 到 satin beauty board 构成一条完整的近景展示路径。",
    heroImageLabel: "模特封面视觉",
    heroAsset: "seed:iris-hero",
    showcaseItems: [
      {
        workId: "luminous-closeup-dossier",
        title: "发光近景档案",
        subtitle: "封面人像",
        description: "突出眼神停顿、肤质层次和妆面完成度。",
        coverAsset: "seed:iris-hero",
      },
      {
        workId: "monochrome-skin-study",
        title: "黑白肌理研究",
        subtitle: "近景试拍",
        description: "用黑白关系直接观察皮肤纹理和面部线条。",
        coverAsset: "seed:iris-monochrome-close",
      },
      {
        workId: "editorial-color-story",
        title: "彩色 editorial 叙事",
        subtitle: "杂志拍摄",
        description: "带更强妆面与服装色彩组织的一组公开样片。",
        coverAsset: "seed:editorial-beauty-brief",
      },
      {
        workId: "satin-beauty-board",
        title: "缎面 beauty board",
        subtitle: "品牌提案",
        description: "为彩妆和珠宝提案准备的近景视觉样本。",
        coverAsset: "seed:beauty-collab-brief",
      },
    ],
  },
  {
    slug: "sora-lin",
    role: "model",
    name: "Sora Lin",
    city: "广州",
    shootingFocus: "街头奢感与都市 lookbook",
    discoveryContext:
      "希望被广州及周边品牌团队、街头 editorial 摄影师与通勤感 campaign 合作者看到",
    externalHandoffUrl: "https://portfolio.example.com/sora",
    publishedAt: "2026-04-04T12:00:00Z",
    updatedAt: "2026-04-04T17:00:00Z",
    tagline:
      "偏街头奢感与动势镜头方向的模特，适合墨镜、外套和城市通勤感品牌拍摄。",
    bio: "Sora 的公开资料强调步态、转身和视线调度，适合需要更都市、更直接、更具节奏感的街头奢感品牌与编辑内容。",
    contactLabel: "联系模特",
    sectionTitle: "编辑精选",
    sectionDescription:
      "以墨镜主视觉、城市银调、楼梯动势和 dusk studio 四个方向组成更具节奏感的公开作品集。",
    heroImageLabel: "模特封面视觉",
    heroAsset: "seed:sora-hero",
    showcaseItems: [
      {
        workId: "sunglasses-signature-walk",
        title: "墨镜签名步态",
        subtitle: "品牌形象",
        description: "以直视镜头和城市步态组成的签名式主视觉。",
        coverAsset: "seed:sora-hero",
      },
      {
        workId: "city-silver-walk",
        title: "城市银调漫步",
        subtitle: "lookbook",
        description: "围绕风感、银灰和轻外景氛围组织的作品。",
        coverAsset: "seed:sora-city-silver",
      },
      {
        workId: "motion-staircase-study",
        title: "楼梯动势研究",
        subtitle: "动作测试",
        description: "把转身、阶梯和都市节奏做成更直接的动作样本。",
        coverAsset: "seed:sunglasses-street-brief",
      },
      {
        workId: "dusk-studio-break",
        title: "dusk studio break",
        subtitle: "封面练习",
        description: "在更轻量的影棚语境里保留步态和停顿感。",
        coverAsset: "seed:editorial-shoot-brief",
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

export function getStudioProfileSlugForRole(role: "photographer" | "model") {
  return role === "photographer" ? "sample-photographer" : "sample-model";
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
