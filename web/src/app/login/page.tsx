import { AuthEntryGrid } from "@/features/auth/auth-entry-grid";

export default function LoginPage() {
  return (
    <AuthEntryGrid
      eyebrow="Sign in"
      title="Welcome back"
      description="Enter through the role that matches your primary creator identity so your studio, profile controls, and future interactions stay aligned."
      submitMode="login"
      alternateHref="/register"
      alternateLabel="Create account"
    />
  );
}
