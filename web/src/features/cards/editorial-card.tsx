import Link from "next/link";

import type { SeedAssetRef } from "@/features/showcase/types";
import { EditorialVisual } from "@/features/shell/editorial-visual";

export type EditorialCardStat = {
  label: string;
  value: string;
};

type EditorialCardProps = {
  href?: string;
  assetRef?: SeedAssetRef;
  visualLabel: string;
  visualDescription?: string;
  visualVariant?: "landscape" | "card" | "portrait";
  imageLoading?: "lazy" | "eager";
  imageSizes?: string;
  title: string;
  summary: string;
  footerText?: string;
  footerTag?: string;
  detailStats?: EditorialCardStat[];
  titleTag?: "h2" | "h3";
  titleClassName?: string;
  cardClassName?: string;
};

const defaultTitleClassName =
  "mt-5 text-xl font-medium leading-7 tracking-[-0.02em] text-[color:var(--accent-strong)] sm:text-2xl";

function EditorialCardContent({
  assetRef,
  visualLabel,
  visualDescription,
  visualVariant = "landscape",
  imageLoading,
  imageSizes,
  title,
  summary,
  footerText,
  footerTag,
  detailStats,
  titleTag = "h3",
  titleClassName,
}: Omit<EditorialCardProps, "href" | "cardClassName">) {
  const TitleTag = titleTag;
  const shouldRenderFooter = footerText || footerTag;

  return (
    <>
      <EditorialVisual
        assetRef={assetRef}
        label={visualLabel}
        variant={visualVariant}
        description={visualDescription}
        imageLoading={imageLoading}
        imageSizes={imageSizes}
      />
      <TitleTag className={titleClassName ?? defaultTitleClassName}>
        {title}
      </TitleTag>
      {detailStats?.length ? (
        <div className="mt-5 grid gap-4 text-sm text-[color:var(--muted-strong)] sm:grid-cols-3">
          {detailStats.map((stat) => (
            <div key={stat.label}>
              <p className="museum-label">{stat.label}</p>
              <p className="mt-2 text-base text-[color:var(--accent-strong)]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      <p
        className={`museum-clamp-2 text-sm leading-6 text-[color:var(--muted-strong)] ${
          detailStats?.length ? "mt-5" : "mt-3"
        }`}
      >
        {summary}
      </p>
      {shouldRenderFooter ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {footerText ? <p className="museum-label">{footerText}</p> : null}
          {footerTag ? <span className="museum-tag">{footerTag}</span> : null}
        </div>
      ) : null}
    </>
  );
}

export function EditorialCard({
  href,
  cardClassName,
  ...contentProps
}: EditorialCardProps) {
  const className = [
    "museum-card",
    "p-5",
    href ? "group block cursor-pointer" : "",
    cardClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = <EditorialCardContent {...contentProps} />;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
