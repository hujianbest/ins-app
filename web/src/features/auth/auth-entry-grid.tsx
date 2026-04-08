import Link from "next/link";

import { authRoles } from "./auth-copy";
import { startDemoSession } from "./actions";

type AuthEntryGridProps = {
  eyebrow: string;
  title: string;
  description: string;
  submitMode: "login" | "register";
  alternateHref: string;
  alternateLabel: string;
};

export function AuthEntryGrid({
  eyebrow,
  title,
  description,
  submitMode,
  alternateHref,
  alternateLabel,
}: AuthEntryGridProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(163,230,255,0.18),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0f172a_58%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">{eyebrow}</p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
          <Link href={alternateHref} className="inline-flex text-sm uppercase tracking-[0.28em] text-cyan-200 transition hover:text-white">
            {alternateLabel}
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {authRoles.map((roleOption) => (
            <form
              key={roleOption.role}
              action={startDemoSession}
              className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur"
            >
              <input type="hidden" name="role" value={roleOption.role} />
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">{roleOption.title}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{roleOption.description}</p>
              <button
                type="submit"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
              >
                {submitMode === "login" ? roleOption.loginLabel : roleOption.registerLabel}
              </button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
