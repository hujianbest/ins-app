import { notFound } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import { isProfileFavorited } from "@/features/engagement/state";
import {
  getPhotographerProfileBySlug,
  photographerProfiles,
} from "@/features/showcase/sample-data";
import { ProfileShowcasePage } from "@/features/showcase/profile-showcase-page";

export function generateStaticParams() {
  return photographerProfiles.map((profile) => ({ slug: profile.slug }));
}

export default async function PhotographerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getPhotographerProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const sessionRole = await getSessionRole();
  const isFavorited = await isProfileFavorited(profile.slug);

  return (
    <ProfileShowcasePage
      profile={profile}
      isSignedIn={Boolean(sessionRole)}
      isFavorited={isFavorited}
      returnPath={`/photographers/${profile.slug}`}
    />
  );
}
