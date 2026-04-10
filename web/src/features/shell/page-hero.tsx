import Link from "next/link";
import type { ReactNode } from "react";

type PageHeroAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: PageHeroAction[];
  supporting?: ReactNode;
  aside?: ReactNode;
};

function getActionClassName(variant: PageHeroAction["variant"] = "secondary") {
  if (variant === "primary") {
    return "inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100";
  }

  return "inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:border-cyan-200/60 hover:bg-white/5";
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions = [],
  supporting,
  aside,
}: PageHeroProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/80">
            {eyebrow}
          </p>
          <h1 className="max-w-5xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            {description}
          </p>
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={`${action.href}:${action.label}`}
                href={action.href}
                className={getActionClassName(action.variant)}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}

        {supporting ? <div>{supporting}</div> : null}
      </div>

      {aside ? (
        <div className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.68)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          {aside}
        </div>
      ) : null}
    </section>
  );
}
