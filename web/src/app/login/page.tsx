import { AuthEntryGrid } from "@/features/auth/auth-entry-grid";
import { getAuthStatusMessage } from "@/features/auth/auth-feedback";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <AuthEntryGrid
      eyebrow="登录"
      title="欢迎回来"
      submitMode="login"
      alternateHref="/register"
      alternateLabel="注册"
      statusMessage={getAuthStatusMessage("login", resolvedSearchParams)}
    />
  );
}
