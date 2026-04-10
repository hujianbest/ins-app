import { expect, test, type Page } from "@playwright/test";

function trackPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  return errors;
}

test("public discovery surfaces render and search returns results", async ({
  page,
}) => {
  const pageErrors = trackPageErrors(page);

  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /以作品、创作者与合作灵感重构 Lens Archive 的首页主线/,
    }),
  ).toBeVisible();

  await page.goto("/discover");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /持续浏览作品、创作者与值得跟进的摄影灵感/,
    }),
  ).toBeVisible();

  await page.goto("/search");
  await expect(page.locator('input[name="q"]')).toBeVisible();
  await page.locator('input[name="q"]').fill("上海");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/search\?q=/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /搜索 “上海”/,
    }),
  ).toBeVisible();
  await expect(page.getByText(/当前共命中/)).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test("auth entries render and signed-out studio access redirects to login", async ({
  page,
}) => {
  const pageErrors = trackPageErrors(page);

  await page.goto("/login");
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: /登录进入工作台/ }),
  ).toBeVisible();

  await page.goto("/register");
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: /创建账号并进入工作台/ }),
  ).toBeVisible();

  await page.goto("/studio");
  await page.waitForURL(/\/login/);
  await expect(page.locator('input[name="email"]')).toBeVisible();

  expect(pageErrors).toEqual([]);
});
