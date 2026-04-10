import Link from "next/link";

import { authRoles } from "./auth-copy";
import { loginAccountAction, registerAccountAction } from "./actions";

type AuthEntryGridProps = {
  eyebrow: string;
  title: string;
  description: string;
  submitMode: "login" | "register";
  alternateHref: string;
  alternateLabel: string;
  statusMessage?: string | null;
};

export function AuthEntryGrid({
  eyebrow,
  title,
  description,
  submitMode,
  alternateHref,
  alternateLabel,
  statusMessage,
}: AuthEntryGridProps) {
  const action =
    submitMode === "login" ? loginAccountAction : registerAccountAction;

  return (
    <main className="pb-24 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col justify-center gap-10 px-6 pt-14 sm:px-10 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">
                {eyebrow}
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {authRoles.map((roleOption) => (
                <div
                  key={roleOption.role}
                  className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                    {roleOption.title}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    {roleOption.description}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={alternateHref}
              className="inline-flex text-sm uppercase tracking-[0.28em] text-cyan-200 transition hover:text-white"
            >
              {alternateLabel}
            </Link>
          </div>

          <form
            action={action}
            className="grid gap-6 rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.74)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                Account Access
              </p>
              <p className="text-sm leading-7 text-slate-300">
                使用真实邮箱和密码建立登录态，后续工作台、互动和合作线索都会绑定到你的当前账号。
              </p>
            </div>

            {statusMessage ? (
              <div className="rounded-[1.4rem] border border-cyan-200/25 bg-cyan-200/8 px-4 py-3 text-sm leading-7 text-cyan-50">
                {statusMessage}
              </div>
            ) : null}

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/45">
                邮箱
              </span>
              <input
                type="email"
                name="email"
                placeholder="creator@example.com"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/45">
                密码
              </span>
              <input
                type="password"
                name="password"
                placeholder="至少 8 位字符"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
              />
            </label>

            {submitMode === "register" ? (
              <fieldset className="space-y-3">
                <legend className="text-xs uppercase tracking-[0.28em] text-white/45">
                  主身份
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {authRoles.map((roleOption, index) => (
                    <label
                      key={roleOption.role}
                      className="flex cursor-pointer flex-col gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4 text-sm text-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="primaryRole"
                          value={roleOption.role}
                          defaultChecked={index === 0}
                        />
                        <span className="text-base font-medium text-white">
                          {roleOption.title}
                        </span>
                      </div>
                      <span className="leading-7">{roleOption.description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <button
              type="submit"
              className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
            >
              {submitMode === "login"
                ? "登录进入工作台"
                : "创建账号并进入工作台"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
