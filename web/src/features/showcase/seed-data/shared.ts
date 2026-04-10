import type {
  PublicOpportunityPost,
  PublicWork,
  SeedAssetRef,
} from "../types";

export function buildWork(
  input: Omit<PublicWork, "contactLabel"> & { coverAsset: SeedAssetRef },
): PublicWork {
  return {
    ...input,
    contactLabel: input.ownerRole === "photographer" ? "联系摄影师" : "联系模特",
  };
}

export function buildOpportunityPost(
  input: Omit<PublicOpportunityPost, "contactLabel"> & {
    coverAsset: SeedAssetRef;
  },
): PublicOpportunityPost {
  return {
    ...input,
    contactLabel: input.ownerRole === "photographer" ? "联系摄影师" : "联系模特",
  };
}
