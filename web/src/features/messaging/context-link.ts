/**
 * Phase 2 — Threaded Messaging V1 (UI design §10.4.1).
 *
 * Pure-function mapping from `contextRef` (stored in `message_threads.context_ref`)
 * to a human-readable label + href used in the inbox UI. Does NOT
 * touch sqlite — V1 only renders ids; V2 may evaluate caching titles.
 */
export type ContextSourceLink = {
  label: string;
  href?: string;
};

export function buildContextSourceLink(
  contextRef: string | undefined,
): ContextSourceLink {
  if (!contextRef) return { label: "直接对话" };

  if (contextRef.startsWith("work:")) {
    const workId = contextRef.slice("work:".length);
    return { label: `来自作品 #${workId}`, href: `/works/${workId}` };
  }

  if (contextRef.startsWith("profile:")) {
    const rest = contextRef.slice("profile:".length);
    const sepIdx = rest.indexOf(":");
    if (sepIdx === -1) return { label: `来自主页 #${rest}` };
    const role = rest.slice(0, sepIdx);
    const slug = rest.slice(sepIdx + 1);
    const roleLabel = role === "photographer" ? "摄影师" : role === "model" ? "模特" : role;
    return { label: `来自${roleLabel}主页 #${slug}`, href: `/${role}s/${slug}` };
  }

  if (contextRef.startsWith("opportunity:")) {
    const postId = contextRef.slice("opportunity:".length);
    return {
      label: `来自合作诉求 #${postId}`,
      href: `/opportunities/${postId}`,
    };
  }

  return { label: `来自 #${contextRef}` };
}
