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
      "登录后即可在同一个工作台里管理作品集、准备面向客户的展示内容，并发布约拍诉求。",
    loginLabel: "以摄影师身份继续",
    registerLabel: "创建摄影师账号",
    studioTitle: "摄影师工作台",
  },
  {
    role: "model",
    title: "模特",
    description:
      "登录后即可完善公开主页、管理展示内容，并及时回应合作邀约与约拍诉求。",
    loginLabel: "以模特身份继续",
    registerLabel: "创建模特账号",
    studioTitle: "模特工作台",
  },
];

export function getAuthRoleCopy(role: AuthRole) {
  return authRoles.find((item) => item.role === role);
}
