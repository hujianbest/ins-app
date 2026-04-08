import { AuthEntryGrid } from "@/features/auth/auth-entry-grid";

export default function RegisterPage() {
  return (
    <AuthEntryGrid
      eyebrow="注册"
      title="选择你的创作者身份"
      description="首个版本先从单一主身份开始注册，然后进入围绕摄影师或模特工作流建立的工作台。"
      submitMode="register"
      alternateHref="/login"
      alternateLabel="登录"
    />
  );
}
