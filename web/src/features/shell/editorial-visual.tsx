import Image from "next/image";
import type { CSSProperties } from "react";

import { resolveSeedVisualAsset } from "@/features/showcase/sample-data";

const frameStyleByVariant: Record<
  "landscape" | "card" | "portrait",
  CSSProperties
> = {
  landscape: {
    borderRadius: "1.65rem",
  },
  card: {
    borderRadius: "1.55rem",
  },
  portrait: {
    borderRadius: "1.85rem",
  },
};

const mediaStyleByVariant: Record<
  "landscape" | "card" | "portrait",
  CSSProperties
> = {
  landscape: {
    aspectRatio: "16 / 10",
    borderRadius: "1.2rem",
  },
  card: {
    aspectRatio: "4 / 3",
    borderRadius: "1.15rem",
  },
  portrait: {
    aspectRatio: "4 / 5",
    borderRadius: "1.4rem",
  },
};

const frameBaseStyle: CSSProperties = {
  pointerEvents: "none",
  padding: "0.7rem",
  border: "1px solid var(--surface-border)",
  background: "rgba(255, 252, 248, 0.88)",
  boxShadow: "var(--shadow-soft)",
};

const mediaBaseStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(180deg, rgba(236, 227, 214, 0.42), rgba(75, 67, 59, 0.18))",
};

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background:
    "linear-gradient(to top, rgba(18, 14, 10, 0.72), rgba(18, 14, 10, 0.14), transparent 54%)",
};

const contentStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  height: "100%",
  alignItems: "flex-end",
  padding: "1.25rem",
  pointerEvents: "none",
} as const;

type EditorialVisualProps = {
  assetRef?: string;
  label: string;
  variant: keyof typeof frameStyleByVariant;
  description?: string;
  showSourceLabel?: boolean;
};

export function EditorialVisual({
  assetRef,
  label,
  variant,
  description,
  showSourceLabel = false,
}: EditorialVisualProps) {
  const asset = resolveSeedVisualAsset(assetRef);

  return (
    <div
      style={{
        ...frameBaseStyle,
        ...frameStyleByVariant[variant],
      }}
    >
      <div
        style={{
          ...mediaBaseStyle,
          ...mediaStyleByVariant[variant],
        }}
      >
        {asset ? (
          <Image
            src={asset.imageUrl}
            alt={asset.alt}
            fill
            unoptimized
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            style={{
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        ) : null}
        <div style={overlayStyle} />
        <div style={contentStyle}>
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/88">
              {label}
            </p>
            {description ? (
              <p className="max-w-xs text-sm leading-7 text-white/85">
                {description}
              </p>
            ) : null}
            {showSourceLabel && asset ? (
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">
                Source: {asset.sourceName}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
