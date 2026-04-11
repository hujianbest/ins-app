import { buildCreatorProfileId } from "@/features/community/contracts";
import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import type {
  CommunityRepositoryBundle,
  CommunityRole,
  DiscoveryEventCreateInput,
} from "@/features/community/types";

export function buildDiscoveryProfileTargetId(
  role: CommunityRole,
  slug: string,
) {
  return buildCreatorProfileId(role, slug);
}

export async function recordDiscoveryEvent(
  input: DiscoveryEventCreateInput,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
) {
  return bundle.discovery.record({
    ...input,
    query: input.query ?? "",
  });
}
