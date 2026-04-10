import Link from "next/link";

import type { SiteShellVariant } from "@/features/shell/site-header";

type SiteFooterProps = {
  variant: Exclude<SiteShellVariant, "studio">;
};

function getFooterCopy(variant: SiteFooterProps["variant"]) {
  if (variant === "auth") {
    return {
      eyebrow: "账号",
      title: "登录与浏览",
      description:
        "保留必要入口。",
    };
  }

  return {
    eyebrow: "浏览",
    title: "浏览与发布",
    description:
      "少字，直达入口。",
  };
}

export function SiteFooter({ variant }: SiteFooterProps) {
  const copy = getFooterCopy(variant);

  return (
    <footer className="shell-footer">
      <div className="shell-footer__inner">
        <div className="space-y-3">
          <p className="museum-label">{copy.eyebrow}</p>
          <h2 className="font-display text-4xl leading-none text-[color:var(--accent-strong)] sm:text-5xl">
            {copy.title}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted-strong)] sm:text-base">
            {copy.description}
          </p>
        </div>

        <div className="grid gap-6 text-sm text-[color:var(--muted-strong)] sm:grid-cols-2">
          <div className="space-y-3">
            <p className="museum-label">浏览</p>
            <div className="grid gap-2">
              <Link href="/" className="museum-button-quiet w-fit">
                首页
              </Link>
              <Link href="/discover" className="museum-button-quiet w-fit">
                发现
              </Link>
              <Link href="/search" className="museum-button-quiet w-fit">
                搜索
              </Link>
              <Link href="/opportunities" className="museum-button-quiet w-fit">
                合作
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="museum-label">创作者</p>
            <div className="grid gap-2">
              <Link href="/studio" className="museum-button-quiet w-fit">
                工作台
              </Link>
              <Link href="/login" className="museum-button-quiet w-fit">
                登录
              </Link>
              <Link href="/register" className="museum-button-quiet w-fit">
                注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
