import Link from "next/link";

export type SiteShellVariant = "public" | "auth" | "studio";

const publicLinks = [
  { href: "/", label: "首页" },
  { href: "/discover", label: "发现" },
  { href: "/search", label: "搜索" },
  { href: "/opportunities", label: "合作" },
];

const studioLinks = [
  { href: "/studio", label: "总览" },
  { href: "/studio/profile", label: "主页" },
  { href: "/studio/works", label: "作品" },
  { href: "/studio/opportunities", label: "诉求" },
  { href: "/inbox", label: "收件箱" },
];

type SiteHeaderProps = {
  variant: SiteShellVariant;
};

function getHeaderCopy(variant: SiteShellVariant) {
  if (variant === "studio") {
    return {
      eyebrow: "工作台",
      links: studioLinks,
      secondaryAction: { href: "/discover", label: "站点" },
      primaryAction: { href: "/studio", label: "总览" },
    };
  }

  if (variant === "auth") {
    return {
      eyebrow: "账号",
      links: publicLinks,
      secondaryAction: { href: "/discover", label: "发现" },
      primaryAction: { href: "/login", label: "登录" },
    };
  }

  return {
    eyebrow: "浏览",
    links: publicLinks,
    secondaryAction: { href: "/login", label: "登录" },
    primaryAction: { href: "/studio", label: "发布" },
  };
}

export function SiteHeader({ variant }: SiteHeaderProps) {
  const copy = getHeaderCopy(variant);

  return (
    <header className="shell-header">
      <div className="shell-header__inner">
        <div className="shell-header__brand">
          <Link href="/" className="shell-header__mark">
            LA
          </Link>
          <Link href="/" className="shell-header__title">
            <span className="shell-header__eyebrow">{copy.eyebrow}</span>
            <span className="shell-header__name">Lens Archive</span>
          </Link>
        </div>

        <nav className="shell-header__nav">
          {copy.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shell-header__link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="shell-header__actions">
          <Link
            href={copy.secondaryAction.href}
            className="museum-button-secondary"
          >
            {copy.secondaryAction.label}
          </Link>
          <Link
            href={copy.primaryAction.href}
            className="museum-button-primary"
          >
            {copy.primaryAction.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
