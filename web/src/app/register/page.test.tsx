import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import RegisterPage from "./page";

test("register page presents single-role account creation choices", () => {
  render(<RegisterPage />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /选择你的创作者身份/,
    })
  ).toBeDefined();
  expect(screen.getByText(/^摄影师$/)).toBeDefined();
  expect(screen.getByText(/^模特$/)).toBeDefined();
  expect(screen.getByRole("button", { name: /创建摄影师账号/ })).toBeDefined();
  expect(screen.getByRole("button", { name: /创建模特账号/ })).toBeDefined();
  expect(screen.getByRole("link", { name: /登录/ }).getAttribute("href")).toBe("/login");
});
