import type { AuthRole } from "./types";

export const authRoles: Array<{
  role: AuthRole;
  title: string;
  description: string;
  loginLabel: string;
  registerLabel: string;
  studioTitle: string;
}> = [
  {
    role: "photographer",
    title: "Photographer",
    description:
      "Sign in to manage your portfolio, prepare client-facing work, and publish booking requests from a single studio.",
    loginLabel: "Continue as photographer",
    registerLabel: "Create photographer account",
    studioTitle: "Photographer Studio",
  },
  {
    role: "model",
    title: "Model",
    description:
      "Sign in to shape your public profile, manage showcase content, and respond to collaboration opportunities.",
    loginLabel: "Continue as model",
    registerLabel: "Create model account",
    studioTitle: "Model Studio",
  },
];

export function getAuthRoleCopy(role: AuthRole) {
  return authRoles.find((item) => item.role === role);
}
