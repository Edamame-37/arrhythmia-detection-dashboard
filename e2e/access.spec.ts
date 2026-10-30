import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: '{"message":"Authentication required"}',
    }),
  );
  await page.route("https://**/auth/v1/**", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: '{"message":"No test session"}',
    }),
  );
});
for (const route of [
  "/patient/monitor",
  "/doctor/monitor",
  "/admin/devices",
  "/patient/history",
]) {
  test("anonymous cannot open " + route, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator("form")).toBeVisible();
    expect(errors).toEqual([]);
  });
}
test("corrupt stored preferences do not crash mobile login", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    localStorage.setItem("app_preferences", "{invalid");
    localStorage.setItem("user_role", "admin");
  });
  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator("form")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("password reset is reachable without a private session", async ({
  page,
}) => {
  await page.goto("/auth/reset-password", { waitUntil: "domcontentloaded" });
  await expect(page.locator("input[type=email]")).toBeVisible();
});
