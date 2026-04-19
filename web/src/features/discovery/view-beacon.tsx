"use client";

import { useEffect } from "react";

import type {
  CommunityTargetType,
  DiscoveryEventType,
} from "@/features/community/types";

type DiscoveryViewBeaconProps = {
  eventType: DiscoveryEventType;
  targetType: CommunityTargetType;
  targetId: string;
  targetProfileId?: string;
  surface: string;
  query?: string;
};

function buildDedupeKey({
  eventType,
  targetId,
  surface,
}: Pick<DiscoveryViewBeaconProps, "eventType" | "targetId" | "surface">) {
  return `lens-archive:discovery:${eventType}:${targetId}:${surface}`;
}

export function DiscoveryViewBeacon(props: DiscoveryViewBeaconProps) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const dedupeKey = buildDedupeKey(props);

    try {
      if (window.sessionStorage.getItem(dedupeKey)) {
        return;
      }

      window.sessionStorage.setItem(dedupeKey, "1");
    } catch {
      // If session storage is unavailable, still attempt best-effort delivery.
    }

    const payload = JSON.stringify(props);

    if (
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon(
        "/api/discovery-events",
        new Blob([payload], { type: "application/json" }),
      )
    ) {
      return;
    }

    void fetch("/api/discovery-events", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  }, [props]);

  return null;
}
