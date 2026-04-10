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
      description="使用真实邮箱和密码继续进入工作台，后续主页维护、作品发布和互动行为都会绑定到你的账号。"
      submitMode="login"
      alternateHref="/register"
      alternateLabel="创建账号"
      statusMessage={getAuthStatusMessage("login", resolvedSearchParams)}
    />
  );
}
