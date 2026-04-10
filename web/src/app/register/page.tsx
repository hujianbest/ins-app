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
      title="创建你的创作者账号"
      description="首个版本仍然保留单一主身份模型，但注册过程已经切换为真实邮箱与密码，会在成功后直接建立登录会话。"
      submitMode="register"
      alternateHref="/login"
      alternateLabel="登录"
      statusMessage={getAuthStatusMessage("register", resolvedSearchParams)}
    />
  );
}
