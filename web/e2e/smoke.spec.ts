import { expect, test, type Page } from "@playwright/test";

function trackPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  return errors;
}

function createUniqueCredentials() {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `playwright-${nonce}@example.com`,
    password: `pw-${nonce}-secure`,
  };
}

async function expectStudioWorkspace(page: Page) {
  await expect(
    page.getByRole("link", { name: /编辑公开主页/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /管理作品条目/ }),
  ).toBeVisible();
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

test("register and login submissions both reach the protected studio workspace", async ({
  page,
}) => {
  const pageErrors = trackPageErrors(page);
  const credentials = createUniqueCredentials();

  await page.goto("/register");
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page
    .locator('input[name="primaryRole"][value="photographer"]')
    .check();
  await page
    .getByRole("button", { name: /创建账号并进入工作台/ })
    .click();
  await page.waitForURL(/\/studio$/);
  await expectStudioWorkspace(page);

  await page.context().clearCookies();

  await page.goto("/studio");
  await page.waitForURL(/\/login/);
  await expect(page.locator('input[name="email"]')).toBeVisible();

  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole("button", { name: /登录进入工作台/ }).click();
  await page.waitForURL(/\/studio$/);
  await expectStudioWorkspace(page);

  expect(pageErrors).toEqual([]);
});

test("discover surface links into a public work detail page", async ({
  page,
}) => {
  const pageErrors = trackPageErrors(page);

  await page.goto("/discover");
  const firstWorkLink = page.locator('a[href^="/works/"]').first();
  await expect(firstWorkLink).toBeVisible();
  const firstWorkTitle = firstWorkLink.locator("h3");
  const workTitle = await firstWorkTitle.textContent();
  const href = await firstWorkLink.getAttribute("href");

  expect(href).toBeTruthy();

  await firstWorkTitle.click();
  await page.waitForURL(/\/works\//);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: workTitle?.trim() ?? "",
    }),
  ).toBeVisible();
  await expect(page.getByText("作品说明")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /返回主页/ }),
  ).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test("signed-out studio access redirects to login", async ({
  page,
}) => {
  const pageErrors = trackPageErrors(page);
  await page.goto("/studio");
  await page.waitForURL(/\/login/);
  await expect(page.locator('input[name="email"]')).toBeVisible();

  expect(pageErrors).toEqual([]);
});
