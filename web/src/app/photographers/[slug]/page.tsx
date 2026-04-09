import { notFound } from "next/navigation";

import { getSessionContext } from "@/features/auth/session";
import {
  getPublicProfilePageModel,
  listPublicProfilePageParams,
} from "@/features/community/public-read-model";
import { isProfileFollowedByViewer } from "@/features/social/follows";
import { ProfileShowcasePage } from "@/features/showcase/profile-showcase-page";

export async function generateStaticParams() {
  return listPublicProfilePageParams("photographer");
}

export default async function PhotographerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getPublicProfilePageModel("photographer", slug);

  if (!profile) {
    notFound();
  }

  const session = await getSessionContext();
  const isFollowing = await isProfileFollowedByViewer(
    session.accountId,
    profile.role,
    profile.slug,
  );

  return (
    <ProfileShowcasePage
      profile={profile}
      isSignedIn={session.isAuthenticated}
      isFollowing={isFollowing}
      returnPath={`/photographers/${profile.slug}`}
    />
  );
}
