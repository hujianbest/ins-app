import { AuthEntryGrid } from "@/features/auth/auth-entry-grid";

export default function RegisterPage() {
  return (
    <AuthEntryGrid
      eyebrow="Register"
      title="Choose your creator role"
      description="Start with a single primary identity for the first release, then enter a studio shaped around photographer or model workflows."
      submitMode="register"
      alternateHref="/login"
      alternateLabel="Sign in"
    />
  );
}
