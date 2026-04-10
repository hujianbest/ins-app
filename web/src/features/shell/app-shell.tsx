"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/features/shell/site-footer";
import { SiteHeader, type SiteShellVariant } from "@/features/shell/site-header";

type AppShellProps = {
  children: ReactNode;
};

function getShellVariant(pathname: string): SiteShellVariant {
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return "auth";
  }

  if (pathname.startsWith("/studio") || pathname.startsWith("/inbox")) {
    return "studio";
  }

  return "public";
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() ?? "/";
  const variant = getShellVariant(pathname);

  return (
    <div className={`app-shell app-shell--${variant}`}>
      <SiteHeader variant={variant} />
      <div className="shell-viewport flex min-h-[calc(100vh-10rem)] flex-col">
        <div className="flex-1">{children}</div>
        {variant === "studio" ? null : <SiteFooter variant={variant} />}
      </div>
    </div>
  );
}
