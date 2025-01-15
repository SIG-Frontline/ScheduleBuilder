import { test, expect } from "@playwright/test";

test("returns 200", async ({ page }) => {
  await page.goto("/");

  const status = await page.evaluate(() => {
    return fetch("/").then((response) => response.status);
  });

  expect(status).toBe(200);
});

test("make a plan for latest term", async ({ page }) => {
  await page.goto("/");
  const newPlanButton = await page.locator("button:has-text('New Plan')");
  await newPlanButton.click();
  const planNameInput = await page.locator(
    "input[placeholder='Enter Plan Name']"
  );
  await planNameInput.fill("My Test Plan");
  //placeholder="Select Term" input
  const termInput = await page.locator("input[placeholder='Select Term']");
  //Select the first option
  await termInput.click();
  //click on the first option
  const firstOption = await page.locator(".mantine-Select-option").first();
  await firstOption.click();

  //click on the Create Button
  const createButton = await page.locator("button:has-text('Create')");
  await createButton.click();
  expect(await page.locator("text=My Test Plan").isVisible()).toBeTruthy();
});
