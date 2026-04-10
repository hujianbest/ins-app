import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import LoginPage from "./page";

test("login page renders real credential fields for account access", async () => {
  const page = await LoginPage({});

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /欢迎回来/,
    })
  ).toBeDefined();
  expect(screen.getByLabelText(/邮箱/)).toBeDefined();
  expect(screen.getByLabelText(/密码/)).toBeDefined();
  expect(screen.getByRole("button", { name: /登录进入工作台/ })).toBeDefined();
  expect(screen.getByRole("link", { name: /创建账号/ }).getAttribute("href")).toBe("/register");
});
