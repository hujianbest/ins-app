import { cookies } from "next/headers";

export const workLikesCookieName = "lens-archive-work-likes";
export const profileFavoritesCookieName = "lens-archive-profile-favorites";

export function parseCookieList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toggleListValue(values: string[], target: string) {
  return values.includes(target) ? values.filter((value) => value !== target) : [...values, target];
}

export function serializeCookieList(values: string[]) {
  return values.join(",");
}

async function getCookieList(name: string) {
  const cookieStore = await cookies();
  return parseCookieList(cookieStore.get(name)?.value);
}

export async function isWorkLiked(workId: string) {
  const likedWorkIds = await getCookieList(workLikesCookieName);
  return likedWorkIds.includes(workId);
}

export async function isProfileFavorited(profileSlug: string) {
  const favoritedProfileSlugs = await getCookieList(profileFavoritesCookieName);
  return favoritedProfileSlugs.includes(profileSlug);
}
