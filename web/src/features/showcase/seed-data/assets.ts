import type { SeedAssetRef, SeedVisualAsset } from "../types";

function buildLocalMirrorAsset(
  id: SeedAssetRef,
  imageUrl: string,
  alt: string,
  sourceName: string,
  sourceUrl: string,
): SeedVisualAsset {
  return {
    id,
    imageUrl,
    alt,
    sourceName,
    sourceUrl,
    licenseLabel: "Pexels License (local mirror)",
  };
}

export const seedVisualAssets: Record<SeedAssetRef, SeedVisualAsset> = {
  "seed:avery-hero": buildLocalMirrorAsset(
    "seed:avery-hero",
    "/seed/people/avery-hero.jpg",
    "夜色城市中的高对比编辑人像",
    "夜色主视觉本地镜像",
    "https://www.pexels.com/photo/nighttime-urban-portrait-in-modern-city-29817584/",
  ),
  "seed:avery-bw-street": buildLocalMirrorAsset(
    "seed:avery-bw-street",
    "/seed/works/avery-bw-street.jpg",
    "黑白街头时装感人像",
    "黑白街头本地镜像",
    "https://www.pexels.com/photo/black-and-white-street-fashion-photography-35463532/",
  ),
  "seed:avery-studio-casting": buildLocalMirrorAsset(
    "seed:avery-studio-casting",
    "/seed/works/avery-studio-casting.jpg",
    "具有植物肌理与高反差质感的时尚肖像",
    "影棚 casting 本地镜像",
    "https://www.pexels.com/photo/2915216/",
  ),
  "seed:mika-hero": buildLocalMirrorAsset(
    "seed:mika-hero",
    "/seed/people/mika-hero.jpg",
    "影棚中的专业模特肖像",
    "柔光主页本地镜像",
    "https://www.pexels.com/photo/portrait-of-woman-in-professional-studio-setting-36378240/",
  ),
  "seed:mika-soft-light": buildLocalMirrorAsset(
    "seed:mika-soft-light",
    "/seed/works/mika-soft-light.jpg",
    "柔和材质与安静姿态构成的时装肖像",
    "柔光美妆本地镜像",
    "https://www.pexels.com/photo/2723623/",
  ),
  "seed:mika-lookbook": buildLocalMirrorAsset(
    "seed:mika-lookbook",
    "/seed/works/mika-lookbook.jpg",
    "带有墨镜与缎面手套的编辑时装肖像",
    "白廊 lookbook 本地镜像",
    "https://www.pexels.com/photo/4006513/",
  ),
  "seed:elio-hero": buildLocalMirrorAsset(
    "seed:elio-hero",
    "/seed/people/elio-hero.jpg",
    "低饱和时装编辑肖像",
    "建筑感主页本地镜像",
    "https://www.pexels.com/photo/fashion-editorial-portrait-27902336/",
  ),
  "seed:noa-hero": buildLocalMirrorAsset(
    "seed:noa-hero",
    "/seed/people/noa-hero.jpg",
    "户外时装肖像与大幅布料",
    "海风主视觉本地镜像",
    "https://www.pexels.com/photo/outdoor-fashion-portrait-in-ciudad-de-mexico-35913563/",
  ),
  "seed:iris-hero": buildLocalMirrorAsset(
    "seed:iris-hero",
    "/seed/people/iris-hero.jpg",
    "带有华丽妆面的近景肖像",
    "美妆主页本地镜像",
    "https://www.pexels.com/photo/elegant-portrait-of-a-woman-with-glamorous-makeup-33753916/",
  ),
  "seed:sora-hero": buildLocalMirrorAsset(
    "seed:sora-hero",
    "/seed/people/sora-hero.jpg",
    "带墨镜的都市时装肖像",
    "墨镜主视觉本地镜像",
    "https://www.pexels.com/photo/fashion-portrait-of-woman-in-sunglasses-31719247/",
  ),
  "seed:elio-concrete-lookbook": buildLocalMirrorAsset(
    "seed:elio-concrete-lookbook",
    "/seed/works/elio-concrete-lookbook.jpg",
    "都市街头中的街头时装肖像",
    "混凝土 lookbook 本地镜像",
    "https://www.pexels.com/photo/fashionable-urban-streetwear-portrait-34579430/",
  ),
  "seed:elio-minimal-studio": buildLocalMirrorAsset(
    "seed:elio-minimal-studio",
    "/seed/works/elio-minimal-studio.jpg",
    "极简影棚中的沉静肖像",
    "极简影棚本地镜像",
    "https://www.pexels.com/photo/minimalist-studio-portrait-of-contemplative-person-33379708/",
  ),
  "seed:noa-monochrome-portrait": buildLocalMirrorAsset(
    "seed:noa-monochrome-portrait",
    "/seed/works/noa-monochrome-portrait.jpg",
    "黑白时装人像与强轮廓布光",
    "黑白品牌本地镜像",
    "https://www.pexels.com/photo/stylish-black-and-white-fashion-portrait-30416608/",
  ),
  "seed:iris-monochrome-close": buildLocalMirrorAsset(
    "seed:iris-monochrome-close",
    "/seed/works/iris-monochrome-close.jpg",
    "黑白时装近景肖像",
    "黑白特写本地镜像",
    "https://www.pexels.com/photo/black-and-white-fashion-portrait-of-woman-36083989/",
  ),
  "seed:sora-city-silver": buildLocalMirrorAsset(
    "seed:sora-city-silver",
    "/seed/works/sora-city-silver.jpg",
    "带有轻盈布料与户外感的时装肖像",
    "城市银调本地镜像",
    "https://www.pexels.com/photo/outdoor-fashion-portrait-with-ethereal-fabric-28453979/",
  ),
  "seed:night-editorial-brief": buildLocalMirrorAsset(
    "seed:night-editorial-brief",
    "/seed/opportunities/night-editorial-brief.jpg",
    "带有夜间城市感的街头时装肖像",
    "夜景 brief 本地镜像",
    "https://www.pexels.com/photo/trendy-urban-fashion-street-portrait-34205260/",
  ),
  "seed:editorial-shoot-brief": buildLocalMirrorAsset(
    "seed:editorial-shoot-brief",
    "/seed/opportunities/editorial-shoot-brief.jpg",
    "偏 editorial 的时装拍摄主视觉",
    "拍摄 brief 本地镜像",
    "https://www.pexels.com/photo/editorial-shoot-27906510/",
  ),
  "seed:beauty-collab-brief": buildLocalMirrorAsset(
    "seed:beauty-collab-brief",
    "/seed/opportunities/beauty-collab-brief.jpg",
    "带妆面细节的彩妆合作视觉",
    "美妆合作本地镜像",
    "https://www.pexels.com/photo/portrait-of-woman-with-makeup-20232362/",
  ),
  "seed:berlin-campaign-brief": buildLocalMirrorAsset(
    "seed:berlin-campaign-brief",
    "/seed/opportunities/berlin-campaign-brief.jpg",
    "带城市漫游感的户外时装肖像",
    "城市 campaign 本地镜像",
    "https://www.pexels.com/photo/outdoor-fashion-portrait-in-berlin-28775178/",
  ),
  "seed:editorial-beauty-brief": buildLocalMirrorAsset(
    "seed:editorial-beauty-brief",
    "/seed/opportunities/editorial-beauty-brief.jpg",
    "偏杂志风的彩妆时装肖像",
    "beauty editorial 本地镜像",
    "https://www.pexels.com/photo/editorial-fashion-photo-of-a-beautiful-black-woman-22690354/",
  ),
  "seed:sunglasses-street-brief": buildLocalMirrorAsset(
    "seed:sunglasses-street-brief",
    "/seed/opportunities/sunglasses-street-brief.jpg",
    "墨镜与城市街头结合的时装肖像",
    "墨镜街头本地镜像",
    "https://www.pexels.com/photo/confident-fashion-portrait-with-sunglasses-28860662/",
  ),
};

export const seedContentDisclosure =
  "测试环境使用已本地化的授权图片与虚构演示文案；图片文件随仓库存放，页面不再依赖第三方图片外链，正式商用前请替换为自有素材并复核授权。";

export const seedContentSourceManifest = Object.values(seedVisualAssets);

export function resolveSeedVisualAsset(assetRef?: SeedAssetRef) {
  if (!assetRef) {
    return null;
  }

  if (assetRef.startsWith("/")) {
    return {
      id: assetRef,
      imageUrl: assetRef,
      alt: "本地视觉资源",
      sourceName: "自定义本地资源",
      sourceUrl: assetRef,
      licenseLabel: "Local asset",
    } satisfies SeedVisualAsset;
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
