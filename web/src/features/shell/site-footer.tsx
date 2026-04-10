import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[rgba(4,8,14,0.88)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:px-14">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
            Lens Archive
          </p>
          <h2 className="text-2xl font-semibold text-white">
            面向作品、创作者关系与合作线索的综合摄影平台
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            阶段 1 聚焦成熟浏览体验、真实发布能力和可部署运行时；
            后续再扩展后台、消息和支付能力。
          </p>
        </div>

        <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              浏览
            </p>
            <div className="grid gap-2">
              <Link href="/" className="transition hover:text-white">
                首页
              </Link>
              <Link href="/discover" className="transition hover:text-white">
                发现
              </Link>
              <Link href="/search" className="transition hover:text-white">
                搜索
              </Link>
              <Link href="/opportunities" className="transition hover:text-white">
                合作
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              创作者
            </p>
            <div className="grid gap-2">
              <Link href="/studio" className="transition hover:text-white">
                进入工作台
              </Link>
              <Link href="/login" className="transition hover:text-white">
                登录
              </Link>
              <Link href="/register" className="transition hover:text-white">
                注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
