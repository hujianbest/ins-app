import type { PublicWork } from "../types";

import { buildWork } from "./shared";

export const works: PublicWork[] = [
  buildWork({
    id: "neon-portrait-study",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-04-09T09:00:00Z",
    updatedAt: "2026-04-09T11:00:00Z",
    title: "霓虹人像研究",
    category: "编辑人像",
    description:
      "以夜色城市光源、镜面反射和强轮廓对比建立情绪强烈的编辑人像，用来充当首页与公开主页的主视觉。",
    detailNote:
      "这组作品把合作方最关心的三件事放在同一页里说明白：控光、色彩判断和在复杂城市环境中的人物调度能力。",
    coverAsset: "seed:avery-hero",
  }),
  buildWork({
    id: "monochrome-street-session",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-04-05T09:00:00Z",
    updatedAt: "2026-04-05T17:30:00Z",
    title: "黑白街头片段",
    category: "个人系列",
    description:
      "围绕步态、街景和服装轮廓建立的黑白街头系列，用更克制的色彩策略强调动作与构图本身。",
    detailNote:
      "它不是单纯的氛围图，而是一组方便品牌方快速判断叙事节奏、人物张力与版面适配度的公开系列。",
    coverAsset: "seed:avery-bw-street",
  }),
  buildWork({
    id: "studio-motion-casting",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-04-02T09:00:00Z",
    updatedAt: "2026-04-02T18:00:00Z",
    title: "影棚动态试镜",
    category: "画册导拍",
    description:
      "用接近 casting 的调度与动作连接方式呈现服装材质、表情张力和动态镜头节奏，让客户更快感知执行能力。",
    detailNote:
      "这组内容被设计成品牌前导参考：在更少布景信息里验证人物与镜头的连接是否足够稳定、是否适合进入正式 campaign 拍摄。",
    coverAsset: "seed:avery-studio-casting",
  }),
  buildWork({
    id: "rain-platform-editorial",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-03-30T08:30:00Z",
    title: "雨站台前导片",
    category: "品牌 brief",
    description:
      "把雨夜站台、街头风感和更直接的品牌态度压缩成一组前导型编辑片。",
    detailNote:
      "它更接近客户拿来做内部预判的 brief 可视化素材，用于快速对齐 mood、服装和镜头方向。",
    coverAsset: "seed:night-editorial-brief",
  }),
  buildWork({
    id: "soft-light-editorial",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-04-08T10:00:00Z",
    updatedAt: "2026-04-08T14:00:00Z",
    title: "柔光编辑片",
    category: "美妆片",
    description:
      "强调近景质感、目光稳定性与柔和肌理的一组美妆向样片，适合作为品牌 beauty shoot 的首轮沟通样本。",
    detailNote:
      "这组图的重点不是戏剧化造型，而是让团队能快速判断面部线条、妆面承载与镜头前的停顿感是否足够成熟。",
    coverAsset: "seed:mika-soft-light",
  }),
  buildWork({
    id: "gallery-white-lookbook",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-04-04T10:00:00Z",
    title: "白廊样片册",
    category: "商业形象",
    description:
      "围绕服装轮廓、转身动作与品牌 lookbook 节奏组织的一组公开样片，用于说明商业拍摄中的稳定交付能力。",
    detailNote:
      "白廊语境让服装、身体线条与面部反馈保持清晰，也使这组内容适合直接作为品牌选角与前测参考。",
    coverAsset: "seed:mika-lookbook",
  }),
  buildWork({
    id: "twilight-exterior-story",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-03-28T10:00:00Z",
    title: "暮色外景叙事",
    category: "概念人像",
    description:
      "把城市暮色、安静姿态和角色化视线组织成可公开浏览的外景概念内容，用来展示更完整的情绪表演能力。",
    detailNote:
      "这组作品更偏向氛围叙事，但仍保留足够清晰的动作和服装信息，便于合作方判断外景沟通与情绪稳定性。",
    coverAsset: "seed:editorial-beauty-brief",
  }),
  buildWork({
    id: "portrait-light-signature",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-03-24T10:30:00Z",
    title: "签名感柔光肖像",
    category: "封面人像",
    description:
      "更靠近封面视觉的一组柔光肖像，强调镜头直视、肩颈线条和品牌级的完成度。",
    detailNote:
      "它承担的是主页签名图作用，让团队在进入更细的作品浏览前先判断 Mika 的整体镜头气质。",
    coverAsset: "seed:mika-hero",
  }),
  buildWork({
    id: "concrete-lookbook-series",
    ownerSlug: "elio-ren",
    ownerRole: "photographer",
    ownerName: "Elio Ren",
    publishedAt: "2026-04-07T09:30:00Z",
    updatedAt: "2026-04-07T10:20:00Z",
    title: "混凝土 lookbook",
    category: "商业形象",
    description:
      "把混凝土、金属与街头服装的结构线条收成一组低饱和 lookbook，用来展示更冷静的品牌语言。",
    detailNote:
      "重点不是情绪浓度，而是画面秩序、服装版型判断和在复杂城市背景里保持 clean layout 的能力。",
    coverAsset: "seed:elio-concrete-lookbook",
  }),
  buildWork({
    id: "minimal-studio-notes",
    ownerSlug: "elio-ren",
    ownerRole: "photographer",
    ownerName: "Elio Ren",
    publishedAt: "2026-04-03T09:20:00Z",
    title: "极简影棚札记",
    category: "人物研究",
    description:
      "移除几乎所有环境信息后，用最少元素测试姿态、目光和面料反应，形成一组极简 studio portraits。",
    detailNote:
      "它适合作为客户内部预审的基础素材，因为画面信息非常干净，便于迅速判断人物和服装是否成立。",
    coverAsset: "seed:elio-minimal-studio",
  }),
  buildWork({
    id: "winter-casting-board",
    ownerSlug: "elio-ren",
    ownerRole: "photographer",
    ownerName: "Elio Ren",
    publishedAt: "2026-03-26T09:15:00Z",
    title: "冬日 casting board",
    category: "试拍提案",
    description:
      "为品牌 casting 内审整理的一组冬日人物和服装方向样本，适合作为视觉提案开篇。",
    detailNote:
      "它更像一个可执行的 casting board，而不是完成度最高的大片，重点在于把人物、妆发和服装方向尽快说清楚。",
    coverAsset: "seed:editorial-shoot-brief",
  }),
  buildWork({
    id: "concrete-daybreak-portfolio",
    ownerSlug: "elio-ren",
    ownerRole: "photographer",
    ownerName: "Elio Ren",
    publishedAt: "2026-03-22T08:10:00Z",
    title: "清晨建筑光",
    category: "品牌前导",
    description:
      "用建筑阴影、冷静色面和更克制的人物动作组织出的签名式前导作品。",
    detailNote:
      "它承担的是主页签名作用，让合作方先看到 Elio 对空间、光线和服装结构的整体判断。",
    coverAsset: "seed:elio-hero",
  }),
  buildWork({
    id: "monochrome-tailoring-study",
    ownerSlug: "noa-santoro",
    ownerRole: "photographer",
    ownerName: "Noa Santoro",
    publishedAt: "2026-04-06T08:40:00Z",
    title: "黑白版型研究",
    category: "时装系列",
    description:
      "用黑白反差直接拉出服装版型、手势与站姿张力，是一组判断品牌态度很快的时装研究样片。",
    detailNote:
      "它不依赖复杂场景，而是把所有注意力收回到版型、姿态和镜头距离，适合作为黑白品牌线的前测样片。",
    coverAsset: "seed:noa-monochrome-portrait",
  }),
  buildWork({
    id: "after-hours-campaign",
    ownerSlug: "noa-santoro",
    ownerRole: "photographer",
    ownerName: "Noa Santoro",
    publishedAt: "2026-04-01T08:30:00Z",
    title: "深夜 campaign 提案",
    category: "商业测试",
    description:
      "围绕城市漫游、转身动作和更直接的品牌态度组织的一组 after-hours campaign 试拍。",
    detailNote:
      "它更贴近客户 brief 内部汇报的视觉结构，方便快速讨论是否进入正式 campaign production。",
    coverAsset: "seed:berlin-campaign-brief",
  }),
  buildWork({
    id: "rooftop-shadow-tests",
    ownerSlug: "noa-santoro",
    ownerRole: "photographer",
    ownerName: "Noa Santoro",
    publishedAt: "2026-03-27T08:20:00Z",
    title: "屋顶阴影测试",
    category: "casting 测试",
    description:
      "把高处风感、屋顶线条和阴影关系结合起来，测试人物动作是否能在简陋环境下依然成立。",
    detailNote:
      "这组更偏工作流中的中间证据，用来验证动作逻辑和服装反应，而不是追求完全成片的质感。",
    coverAsset: "seed:night-editorial-brief",
  }),
  buildWork({
    id: "coastal-silhouette-campaign",
    ownerSlug: "noa-santoro",
    ownerRole: "photographer",
    ownerName: "Noa Santoro",
    publishedAt: "2026-03-20T08:00:00Z",
    title: "海风剪影 campaign",
    category: "品牌前导",
    description:
      "通过大幅布料、逆风和侧身轮廓建立高识别度主视觉，把动势和版型同时推进到前景。",
    detailNote:
      "它承担的是签名主视觉职责，让品牌团队在第一眼就理解 Noa 的画面力量和动作组织方式。",
    coverAsset: "seed:noa-hero",
  }),
  buildWork({
    id: "luminous-closeup-dossier",
    ownerSlug: "iris-luo",
    ownerRole: "model",
    ownerName: "Iris Luo",
    publishedAt: "2026-04-05T11:20:00Z",
    updatedAt: "2026-04-05T16:20:00Z",
    title: "发光近景档案",
    category: "封面人像",
    description:
      "围绕眼神停顿、肤质层次和珠宝反光组织的一组封面级近景样片，用来展示更高完成度的 beauty 表现。",
    detailNote:
      "这组内容的价值在于让合作方快速判断 Iris 在强特写条件下是否仍能稳定地维持面部线条和情绪密度。",
    coverAsset: "seed:iris-hero",
  }),
  buildWork({
    id: "monochrome-skin-study",
    ownerSlug: "iris-luo",
    ownerRole: "model",
    ownerName: "Iris Luo",
    publishedAt: "2026-04-02T11:10:00Z",
    title: "黑白肌理研究",
    category: "近景试拍",
    description:
      "通过黑白关系直接观察皮肤纹理、眼神停顿和轮廓曲线，是一组更接近 beauty 测试的近景样本。",
    detailNote:
      "它把妆面色彩拿掉之后，仍然能验证面部结构、镜头停留时间和情绪是否足够成立。",
    coverAsset: "seed:iris-monochrome-close",
  }),
  buildWork({
    id: "editorial-color-story",
    ownerSlug: "iris-luo",
    ownerRole: "model",
    ownerName: "Iris Luo",
    publishedAt: "2026-03-29T11:00:00Z",
    title: "彩色 editorial 叙事",
    category: "杂志拍摄",
    description:
      "通过更强的妆面与服装色彩组织，展示 Iris 在彩色杂志语境下的承载力和完成度。",
    detailNote:
      "这组作品重点不在情节，而在于让妆面、饰品和神态进入更成熟的 editorial 画面关系。",
    coverAsset: "seed:editorial-beauty-brief",
  }),
  buildWork({
    id: "satin-beauty-board",
    ownerSlug: "iris-luo",
    ownerRole: "model",
    ownerName: "Iris Luo",
    publishedAt: "2026-03-21T11:00:00Z",
    title: "缎面 beauty board",
    category: "品牌提案",
    description:
      "为彩妆和珠宝提案准备的近景视觉样本，强调缎面质感、肌肤细节和目光稳定性。",
    detailNote:
      "它更偏向客户开会时直接拿来讨论方向的 beauty board，而不是完整叙事型大片。",
    coverAsset: "seed:beauty-collab-brief",
  }),
  buildWork({
    id: "sunglasses-signature-walk",
    ownerSlug: "sora-lin",
    ownerRole: "model",
    ownerName: "Sora Lin",
    publishedAt: "2026-04-04T12:30:00Z",
    updatedAt: "2026-04-04T17:00:00Z",
    title: "墨镜签名步态",
    category: "品牌形象",
    description:
      "以直视镜头、墨镜和步态控制构成的签名式形象样片，用来快速建立 Sora 的城市品牌感。",
    detailNote:
      "它承担的是主页签名视觉作用，让街头奢感、服装轮廓和人物节奏在第一屏就被识别出来。",
    coverAsset: "seed:sora-hero",
  }),
  buildWork({
    id: "city-silver-walk",
    ownerSlug: "sora-lin",
    ownerRole: "model",
    ownerName: "Sora Lin",
    publishedAt: "2026-03-31T12:10:00Z",
    title: "城市银调漫步",
    category: "lookbook",
    description:
      "围绕风感、银灰色调和城市漫步组织的一组 lookbook，强调轻外景中的节奏感和服装承载力。",
    detailNote:
      "它更适合商业团队判断 Sora 在都市通勤感语境里的镜头稳定性和身体延展。",
    coverAsset: "seed:sora-city-silver",
  }),
  buildWork({
    id: "motion-staircase-study",
    ownerSlug: "sora-lin",
    ownerRole: "model",
    ownerName: "Sora Lin",
    publishedAt: "2026-03-25T12:00:00Z",
    title: "楼梯动势研究",
    category: "动作测试",
    description:
      "通过楼梯、转身和快节奏步态测试镜头前的连贯动作与服装轮廓表现。",
    detailNote:
      "这组内容更靠近 casting 和 rehearsal 阶段，用来验证 Sora 在更强运动感拍摄里的稳定性。",
    coverAsset: "seed:sunglasses-street-brief",
  }),
  buildWork({
    id: "dusk-studio-break",
    ownerSlug: "sora-lin",
    ownerRole: "model",
    ownerName: "Sora Lin",
    publishedAt: "2026-03-19T12:00:00Z",
    title: "dusk studio break",
    category: "封面练习",
    description:
      "在更轻量的影棚语境里保留步态与停顿感，作为城市风格和棚拍之间的过渡样本。",
    detailNote:
      "它适合帮助团队判断 Sora 在不依赖外景信息时，是否仍然能维持鲜明的都市角色感。",
    coverAsset: "seed:editorial-shoot-brief",
  }),
];

export function getWorkById(workId: string) {
  return works.find((work) => work.id === workId);
}

export function getWorksByRole(role: "photographer" | "model") {
  return works.filter((work) => work.ownerRole === role);
}
