import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import RegisterPage from "./page";

test("register page collects credentials and creator role", async () => {
  const page = await RegisterPage({});

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /创建账号/,
    })
  ).toBeDefined();
  expect(screen.getByLabelText(/邮箱/)).toBeDefined();
  expect(screen.getByLabelText(/密码/)).toBeDefined();
  expect(screen.getByRole("radio", { name: /摄影师/ })).toBeDefined();
  expect(screen.getByRole("radio", { name: /模特/ })).toBeDefined();
  expect(screen.getByRole("button", { name: /创建账号/ })).toBeDefined();
  expect(screen.getByRole("link", { name: /登录/ }).getAttribute("href")).toBe("/login");
});
