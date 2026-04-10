import Link from "next/link";

import { authRoles } from "./auth-copy";
import { loginAccountAction, registerAccountAction } from "./actions";

type AuthEntryGridProps = {
  eyebrow: string;
  title: string;
  description?: string;
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
    <main className="museum-page">
      <section className="museum-shell flex w-full flex-col justify-center gap-10 px-0 pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-5">
              <p className="museum-label">{eyebrow}</p>
              <h1 className="font-display max-w-4xl text-5xl leading-none tracking-[-0.04em] text-[color:var(--accent-strong)] sm:text-6xl lg:text-7xl">
                {title}
              </h1>
              {description ? (
                <p className="max-w-3xl text-base leading-8 text-[color:var(--muted-strong)] sm:text-lg">
                  {description}
                </p>
              ) : null}
            </div>

            {submitMode === "register" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {authRoles.map((roleOption) => (
                  <div
                    key={roleOption.role}
                    className="museum-stat p-5"
                  >
                    <p className="museum-label">
                      {roleOption.title}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
                      {roleOption.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <Link
              href={alternateHref}
              className="museum-button-quiet text-sm uppercase tracking-[0.28em]"
            >
              {alternateLabel}
            </Link>
          </div>

          <form
            action={action}
            className="museum-panel grid gap-6 p-6 md:p-7"
          >
            <p className="museum-label">账号</p>

            {statusMessage ? (
              <div className="rounded-[1.4rem] border border-[color:var(--surface-border-strong)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm leading-7 text-[color:var(--accent-strong)]">
                {statusMessage}
              </div>
            ) : null}

            <label className="space-y-2">
              <span className="museum-label">
                邮箱
              </span>
              <input
                type="email"
                name="email"
                placeholder="creator@example.com"
                className="museum-field"
              />
            </label>

            <label className="space-y-2">
              <span className="museum-label">
                密码
              </span>
              <input
                type="password"
                name="password"
                placeholder="至少 8 位"
                className="museum-field"
              />
            </label>

            {submitMode === "register" ? (
              <fieldset className="space-y-3">
                <legend className="museum-label">
                  身份
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {authRoles.map((roleOption, index) => (
                    <label
                      key={roleOption.role}
                      className="museum-stat flex cursor-pointer flex-col gap-3 p-4 text-sm text-[color:var(--muted-strong)]"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="primaryRole"
                          value={roleOption.role}
                          defaultChecked={index === 0}
                        />
                        <span className="text-base font-medium text-[color:var(--accent-strong)]">
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
              className="museum-button-primary"
            >
              {submitMode === "login"
                ? "登录"
                : "创建账号"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
