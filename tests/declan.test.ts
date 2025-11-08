// Learning playwright
import { chromium, test } from "@playwright/test";

test("My first test", async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("localhost:3000");

  await page.waitForTimeout(5000);
});
