import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import RegisterPage from "./page";

test("register page presents single-role account creation choices", () => {
  render(<RegisterPage />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /choose your creator role/i,
    })
  ).toBeDefined();
  expect(screen.getByText(/^photographer$/i)).toBeDefined();
  expect(screen.getByText(/^model$/i)).toBeDefined();
  expect(screen.getByRole("button", { name: /create photographer account/i })).toBeDefined();
  expect(screen.getByRole("button", { name: /create model account/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /sign in/i }).getAttribute("href")).toBe("/login");
});
