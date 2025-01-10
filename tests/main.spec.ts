import { test, expect } from "@playwright/test";

test("returns 200", async ({ page }) => {
  await page.goto("/");

  const status = await page.evaluate(() => {
    return fetch("/").then((response) => response.status);
  });

  expect(status).toBe(200);
});
