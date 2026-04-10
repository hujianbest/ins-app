import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import type { CommunityRepositoryBundle } from "@/features/community/types";

export type WorkCommentViewModel = {
  id: string;
  authorLabel: string;
  body: string;
  createdAt: string;
};

function normalizeCommentBody(body: string) {
  return body.trim();
}

function validateCommentBody(body: string) {
  if (body.length < 1 || body.length > 500) {
    throw new Error("Comment body must be 1..500 characters");
  }
}

function buildCommentId(workId: string, accountId: string) {
  return `${workId}:${accountId}:${Date.now()}`;
}

function getAuthorLabel(accountId: string): string {
  return accountId.endsWith(":photographer") ? "摄影师" : "模特";
}

export async function saveWorkCommentForViewer(
  accountId: string,
  workId: string,
  body: string,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
) {
  const normalizedBody = normalizeCommentBody(body);
  validateCommentBody(normalizedBody);

  return bundle.comments.add({
    id: buildCommentId(workId, accountId),
    workId,
    authorAccountId: accountId,
    body: normalizedBody,
    createdAt: new Date().toISOString(),
  });
}

export async function getWorkComments(
  workId: string,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
): Promise<WorkCommentViewModel[]> {
  const comments = await bundle.comments.listByWorkId(workId);

  return comments.map((comment) => ({
    id: comment.id,
    authorLabel: getAuthorLabel(comment.authorAccountId),
    body: comment.body,
    createdAt: comment.createdAt,
  }));
}
