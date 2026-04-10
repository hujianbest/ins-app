import Image from "next/image";
import type { CSSProperties } from "react";

import { resolveSeedVisualAsset } from "@/features/showcase/sample-data";

const visualShellStyleByVariant: Record<
  "landscape" | "card" | "portrait",
  CSSProperties
> = {
  landscape: {
    aspectRatio: "16 / 10",
    borderRadius: "1.25rem",
  },
  card: {
    aspectRatio: "4 / 3",
    borderRadius: "1.25rem",
  },
  portrait: {
    aspectRatio: "4 / 5",
    borderRadius: "1.5rem",
  },
};

const visualShellBaseStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  pointerEvents: "none",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background:
    "radial-gradient(circle at top, rgba(143, 227, 255, 0.24), transparent 35%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(2,6,23,0.92))",
};

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background:
    "linear-gradient(to top, rgba(2,6,23,0.82), rgba(2,6,23,0.2), transparent)",
};

const contentStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  height: "100%",
  alignItems: "flex-end",
  padding: "1.5rem",
  pointerEvents: "none",
} as const;

type EditorialVisualProps = {
  assetRef?: string;
  label: string;
  variant: keyof typeof visualShellStyleByVariant;
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
        ...visualShellBaseStyle,
        ...visualShellStyleByVariant[variant],
      }}
    >
      {asset ? (
        <Image
          src={asset.imageUrl}
          alt={asset.alt}
          fill
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
          <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/85">
            {label}
          </p>
          {description ? (
            <p className="max-w-xs text-sm leading-7 text-slate-200">
              {description}
            </p>
          ) : null}
          {showSourceLabel && asset ? (
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">
              Source: {asset.sourceName}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
