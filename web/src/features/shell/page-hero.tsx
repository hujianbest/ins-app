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
  tone?: "immersive" | "utility";
};

function getActionClassName(variant: PageHeroAction["variant"] = "secondary") {
  if (variant === "primary") {
    return "museum-button-primary";
  }

  return "museum-button-secondary";
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions = [],
  supporting,
  aside,
  tone = "immersive",
}: PageHeroProps) {
  return (
    <section
      className={`grid gap-10 ${tone === "utility" ? "lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.78fr)] lg:items-start" : "lg:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.84fr)] lg:items-end"}`}
    >
      <div className="space-y-8">
        <div className="space-y-5">
          <p className="museum-label">
            {eyebrow}
          </p>
          <h1
            className={`font-display leading-none tracking-[-0.04em] text-[color:var(--accent-strong)] ${tone === "utility" ? "max-w-4xl text-5xl sm:text-6xl" : "max-w-5xl text-5xl sm:text-6xl lg:text-7xl"}`}
          >
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[color:var(--muted-strong)] sm:text-lg">
            {description}
          </p>
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-3 pt-1">
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
        <div
          className={`museum-panel p-6 md:p-7 ${tone === "utility" ? "museum-panel--soft" : ""}`}
        >
          {aside}
        </div>
      ) : null}
    </section>
  );
}
