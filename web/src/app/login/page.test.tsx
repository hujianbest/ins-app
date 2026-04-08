import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import LoginPage from "./page";

test("login page renders entry options for both creator roles", () => {
  render(<LoginPage />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /welcome back/i,
    })
  ).toBeDefined();
  expect(screen.getByRole("button", { name: /continue as photographer/i })).toBeDefined();
  expect(screen.getByRole("button", { name: /continue as model/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /create account/i }).getAttribute("href")).toBe("/register");
});
