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
    title: "摄影师",
    description:
      "作品与诉求。",
    loginLabel: "以摄影师身份继续",
    registerLabel: "创建摄影师账号",
    studioTitle: "摄影师工作台",
  },
  {
    role: "model",
    title: "模特",
    description:
      "主页与合作。",
    loginLabel: "以模特身份继续",
    registerLabel: "创建模特账号",
    studioTitle: "模特工作台",
  },
];

export function getAuthRoleCopy(role: AuthRole) {
  return authRoles.find((item) => item.role === role);
}
