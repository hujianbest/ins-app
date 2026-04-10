import Image from "next/image";

import { resolveSeedVisualAsset } from "@/features/showcase/sample-data";

type EditorialVisualProps = {
  assetRef?: string;
  label: string;
  aspectClassName: string;
  className?: string;
  imageClassName?: string;
  description?: string;
  showSourceLabel?: boolean;
};

export function EditorialVisual({
  assetRef,
  label,
  aspectClassName,
  className = "",
  imageClassName = "",
  description,
  showSourceLabel = false,
}: EditorialVisualProps) {
  const asset = resolveSeedVisualAsset(assetRef);

  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(143,227,255,0.24),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(2,6,23,0.92))] ${aspectClassName} ${className}`.trim()}
    >
      {asset ? (
        <Image
          src={asset.imageUrl}
          alt={asset.alt}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`.trim()}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,6,23,0.82)] via-[rgba(2,6,23,0.2)] to-transparent" />
      <div className="relative flex h-full items-end p-4 sm:p-6">
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
