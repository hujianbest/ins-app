import { AuthEntryGrid } from "@/features/auth/auth-entry-grid";
import { getAuthStatusMessage } from "@/features/auth/auth-feedback";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <AuthEntryGrid
      eyebrow="注册"
      title="创建账号"
      description="选择身份后开始发布与浏览。"
      submitMode="register"
      alternateHref="/login"
      alternateLabel="登录"
      statusMessage={getAuthStatusMessage("register", resolvedSearchParams)}
    />
  );
}
