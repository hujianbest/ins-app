import { AuthEntryGrid } from "@/features/auth/auth-entry-grid";

export default function LoginPage() {
  return (
    <AuthEntryGrid
      eyebrow="登录"
      title="欢迎回来"
      description="请选择与你当前创作者身份一致的入口登录，这样工作台、主页管理和后续互动都会保持一致。"
      submitMode="login"
      alternateHref="/register"
      alternateLabel="创建账号"
    />
  );
}
