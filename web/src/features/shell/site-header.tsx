import Link from "next/link";

const primaryLinks = [
  { href: "/", label: "首页" },
  { href: "/discover", label: "发现" },
  { href: "/search", label: "搜索" },
  { href: "/opportunities", label: "合作" },
  { href: "/studio", label: "工作台" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(6,10,18,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-14">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.42em] text-white"
          >
            Lens Archive
          </Link>
          <span className="hidden rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/55 md:inline-flex">
            Hybrid Platform
          </span>
        </div>

        <nav className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-200/60 hover:text-white"
          >
            登录
          </Link>
          <Link
            href="/studio"
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
          >
            发布作品
          </Link>
        </div>
      </div>
    </header>
  );
}
