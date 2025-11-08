import { test, expect, Page } from "@playwright/test";

async function createNewPlan(
  page: Page,
  planName: string = "Test Plan",
  term: string = "S' 2025"
) {
  await page.click("button:has-text('New Plan')");
  await page.fill("input[placeholder='Enter Plan Name']", planName);
  await page.click("input[placeholder='Select Term']");
  await page.click(`text=${term}`);
  await page.click("button:has-text('Create')");
}

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("Should display search results when typing", async ({ page }) => {
    const searchInput = page.locator(
      "input[placeholder='Search for a course']"
    );
    await searchInput.fill("CS");

    // locates the scrollable area with the results
    const searchResults = page.locator("[data-testid='search-results']");
    await expect(searchResults).toBeVisible();

    // locates the individual first result
    const firstResult = page
      .locator("[data-testid='search-result-item']")
      .first();
    await expect(firstResult).toBeVisible();
  });

  test("Should allow search by course title", async ({ page }) => {
    const searchInput = page.locator(
      "input[placeholder='Search for a course']"
    );
    await searchInput.fill("ASTRONOMY");
    await page.waitForTimeout(1000);

    // locates the scrollable area with the results
    const searchResults = page.locator("[data-testid='search-results']");
    await expect(searchResults).toBeVisible();

    // locates the individual first result
    const firstResult = page
      .locator("[data-testid='search-result-item']")
      .first();
    await expect(firstResult).toContainText("ASTRONOMY");
  });

  test("Should allow search by course subject & course code", async ({
    page,
  }) => {
    const searchInput = page.locator(
      "input[placeholder='Search for a course']"
    );

    await searchInput.fill("MATH");
    await page.waitForTimeout(1000);
    await searchInput.fill("MATH 111");

    const searchResults = page.locator("[data-testid='search-results']");
    await expect(searchResults).toBeVisible();

    // locates the individual first result
    const firstResult = page
      .locator("[data-testid='search-result-item']")
      .first();
    await expect(firstResult).toContainText("MATH 111 CALCULUS I");
  });

  test("Should not display search results if no matches were found", async ({
    page,
  }) => {
    const searchInput = page.locator(
      "input[placeholder='Search for a course']"
    );
    const searchResults = page.locator("[data-testid='search-results']");
    const initialResultsCount = await searchResults.count();
    await searchInput.fill("ZZZZZ");
    await page.waitForTimeout(1000);
    expect(initialResultsCount).toEqual(0);
  });

  test("Should hide results when input is cleared", async ({ page }) => {
    const searchInput = page.locator(
      "input[placeholder='Search for a course']"
    );
    await searchInput.fill("CS");

    const searchResults = page.locator("[data-testid='search-results']");
    await expect(searchResults).toBeVisible();

    await searchInput.fill("");
    await page.waitForTimeout(1000);
    await expect(searchResults).not.toBeVisible();
  });

  test("Should add course to the sections tab when clicked", async ({
    page,
  }) => {
    await createNewPlan(page);
    await page.click("button:has-text('Sections')");

    const searchInput = page.locator(
      "input[placeholder='Search for a course']"
    );
    await searchInput.fill("CS 100");
    await page.waitForTimeout(1000);

    const classButton = page.locator("[data-testid='search-result-item']");
    const selectedText = page.locator("p.mantine-Text-root").first();
    await expect(classButton).toBeVisible();
    await expect(classButton).toBeEnabled();
    await classButton.click();

    await page.waitForTimeout(1000);
    await expect(selectedText).toHaveText("CS 100");
  });

  test("Should allow users to tap enter and autocomplete the course title", async ({
    page,
  }) => {
    const searchInput = page.locator(
      "input[placeholder='Search for a course']"
    );
    await searchInput.fill("PHYS");
    await page.waitForTimeout(1000);
    await searchInput.fill("PHYS 102");


    const searchResults = page.locator("[data-testid='search-results']");
    await expect(searchResults).toBeVisible();

    await searchInput.press("Enter");
    await page.waitForTimeout(1000);
    await expect(searchInput).toHaveValue("PHYS 102 GENERAL PHYSICS I");
    
  });

  test("Should allow users to use arrow keys to select and add course", async ({
    page,
  }) => {
    await createNewPlan(page);
    await page.click("button:has-text('Sections')");

    const searchInput = page.locator(
      "input[placeholder='Search for a course']"
    );
    await searchInput.fill("PHYS");
    await page.waitForTimeout(1000);
    await searchInput.fill("PHYS 11");

    const searchResults = page.locator("[data-testid='search-results']");
    await expect(searchResults).toBeVisible();

    await searchInput.press("ArrowDown");
    await searchInput.press("Enter");
    await searchInput.press("Enter");

    const selectedText = page.locator("p.mantine-Text-root").first();
    await expect(selectedText).toBeVisible();
    await expect(selectedText).toHaveText("PHYS 111");
  });
});
