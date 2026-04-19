"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Phase 2 — Threaded Messaging V1 (UI-ADR-1, design §9.10, I-9).
 *
 * Client component that triggers an SSR re-fetch every `intervalMs`
 * (default 30 s) by calling `router.refresh()`. Holds NO thread or
 * message data — props only carry the polling interval. Renders no
 * visible DOM.
 */
export function InboxThreadPoll({
  intervalMs = 30_000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
