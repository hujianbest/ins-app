import { notFound } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import { isProfileFavorited } from "@/features/engagement/state";
import { getModelProfileBySlug, modelProfiles } from "@/features/showcase/sample-data";
import { ProfileShowcasePage } from "@/features/showcase/profile-showcase-page";

export function generateStaticParams() {
  return modelProfiles.map((profile) => ({ slug: profile.slug }));
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getModelProfileBySlug(slug);

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
      returnPath={`/models/${profile.slug}`}
    />
  );
}
