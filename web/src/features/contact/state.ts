import { cookies } from "next/headers";

import type { AuthRole } from "@/features/auth/types";
import {
  getModelProfileBySlug,
  getOpportunityPostById,
  getPhotographerProfileBySlug,
  getWorkById,
} from "@/features/showcase/sample-data";

export type ContactSourceType = "profile" | "work" | "opportunity";

export type ContactThread = {
  id: string;
  initiatorRole: AuthRole;
  recipientRole: AuthRole;
  participantName: string;
  participantRole: AuthRole;
  sourceType: ContactSourceType;
  sourceLabel: string;
  sourceHref: string;
  preview: string;
};

export const contactThreadsCookieName = "lens-archive-contact-threads";

export function parseContactThreads(value: string | undefined): ContactThread[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as ContactThread[]) : [];
  } catch {
    return [];
  }
}

export function serializeContactThreads(threads: ContactThread[]) {
  return JSON.stringify(threads);
}

function getProfileLabel(role: AuthRole, slug: string) {
  const profile =
    role === "photographer" ? getPhotographerProfileBySlug(slug) : getModelProfileBySlug(slug);

  return {
    sourceLabel: profile ? `Profile: ${profile.name}` : "Profile contact",
    sourceHref: `/${role}s/${slug}`,
    participantName: profile?.name ?? "Creator",
  };
}

function getWorkLabel(workId: string) {
  const work = getWorkById(workId);

  return {
    sourceLabel: work ? `Work: ${work.title}` : "Work contact",
    sourceHref: `/works/${workId}`,
    participantName: work?.ownerName ?? "Creator",
  };
}

function getOpportunityLabel(postId: string) {
  const post = getOpportunityPostById(postId);

  return {
    sourceLabel: post ? `Opportunity: ${post.title}` : "Opportunity contact",
    sourceHref: `/opportunities/${postId}`,
    participantName: post?.ownerName ?? "Creator",
  };
}

export function buildContactThread(
  initiatorRole: AuthRole,
  recipientRole: AuthRole,
  recipientSlug: string,
  sourceType: ContactSourceType,
  sourceId: string
): ContactThread {
  const sourceDetails =
    sourceType === "profile"
      ? getProfileLabel(recipientRole, recipientSlug)
      : sourceType === "work"
        ? getWorkLabel(sourceId)
        : getOpportunityLabel(sourceId);

  return {
    id: `${initiatorRole}:${recipientRole}:${sourceType}:${sourceId}`,
    initiatorRole,
    recipientRole,
    participantName: sourceDetails.participantName,
    participantRole: recipientRole,
    sourceType,
    sourceLabel: sourceDetails.sourceLabel,
    sourceHref: sourceDetails.sourceHref,
    preview: `New inquiry started from this ${sourceType}.`,
  };
}

export function upsertContactThread(threads: ContactThread[], nextThread: ContactThread) {
  return threads.some((thread) => thread.id === nextThread.id)
    ? threads
    : [nextThread, ...threads];
}

export async function getInboxThreadsForRole(role: AuthRole) {
  const cookieStore = await cookies();
  const threads = parseContactThreads(cookieStore.get(contactThreadsCookieName)?.value);

  return threads.filter((thread) => thread.recipientRole === role || thread.initiatorRole === role);
}
