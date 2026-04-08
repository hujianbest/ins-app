import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import LoginPage from "./page";

test("login page renders entry options for both creator roles", () => {
  render(<LoginPage />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /欢迎回来/,
    })
  ).toBeDefined();
  expect(screen.getByRole("button", { name: /以摄影师身份继续/ })).toBeDefined();
  expect(screen.getByRole("button", { name: /以模特身份继续/ })).toBeDefined();
  expect(screen.getByRole("link", { name: /创建账号/ }).getAttribute("href")).toBe("/register");
});
