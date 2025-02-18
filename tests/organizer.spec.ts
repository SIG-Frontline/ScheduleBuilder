import { test, expect, Page } from "@playwright/test";

// FIX: these tests are not completely working, so take these results with a grain of salt

async function addClasses(page: Page, classes: string[] ) {
	for(const c of classes) {
		const name = c.match(/[A-Z]+/);
		const num = c.match(/[0-9]+/);

		if(!name || !num) continue;

		await page.fill("input[placeholder='Search for a course']", name[0]);
		await page.fill("input[placeholder='Search for a course']", c);
		await page.click(`text=${num[0]}`);
		await expect(page.locator("input[placeholder='Search for a course']")).toHaveValue("");
	}
}

async function checkClasses(page: Page, sections: string[]) {
	for(const s of sections) {
		const name = s.split('-')[0];

		const buttonLocator = page.getByRole('button', { name: `remove change color ${name}` });

		await buttonLocator.scrollIntoViewIfNeeded();
		await buttonLocator.click();

		const radioMenuLocator = page.getByRole('radio', {name: s});

		//await radioMenuLocator.scrollIntoViewIfNeeded();
		await expect(radioMenuLocator).toBeChecked({timeout: 10000});
	}
}

async function checkNoClasses(page: Page, classes: string[]) {
	for(const c of classes) {
		await page.click(`button:has-text('${c}')`);
		// FIX: might not work when there are more than 1 sections for a class
		await expect(page.getByRole('radio')).toBeChecked({checked: false});
	}
}

test.describe("organizer", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("localhost:3000");
		
		// Creates a new test plan
		await page.click("button:has-text('New Plan')");
		await page.fill("input[placeholder='Enter Plan Name']", "Test Plan");
		await page.click("input[placeholder='Select Term']");
		await page.click("text=S\' 2025");
		await page.click("button:has-text('Create')");
		await page.click("button:has-text('Sections')");
	});

	test("do not organize a schedule with no plan", async ({ page }) => {
		// Deletes the current plan
		await page.click("button:has-text('Plans')");
		await page.getByLabel("more").click();
		await page.click("button:has-text('Delete')");

		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(1000); // TODO: Change to when the organizer completes

		expect(page.getByText("No plan could be generated!")).toBeVisible();
	});

	test("do not organize a schedule with no classes", async ({ page }) => {
		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(1000); // TODO: Change to when the organizer completes
		
		expect(page.getByText("No plan could be generated!")).toBeVisible();
	});

	test("return correct schedule when only one schedule exists", async ({ page }) => {

		// Adds the classes
		await addClasses(page, ["CHE260", "CHEM236", "MATH225", "EVSC416"]);

		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(1000); // TODO: Change to when the organizer completes

		// Check correct sections have been selected
		await page.click("text=Sections");

		await checkClasses(page, ['CHE 260-002', 'CHEM 236-002', 'MATH 225-102', 'EVSC 416-002']);
	});

	test("create valid dorming schedule", async ({ page }) => {
		// Adds the classes
		await addClasses(page, ["CS288", "CS332", "CS356", "CS301"]);

		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(1000); // TODO: Change to when the organizer completes
		
		// Check correct sections have been selected
		await page.click("text=Sections");

		await checkClasses(page, ['CS 288-102', 'CS 332-012', 'CS 356-H04', 'CS 301-006']);
	});

	test("create valid commuting schedule", async ({ page }) => {
		// Adds the classes
		await addClasses(page, ["CS288", "CS332", "CS356", "CS301"]);
		
		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text=Commuter");

		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(1000); // TODO: Change to when the organizer completes

		// Check correct sections have been selected
		await page.click("text=Sections");

		await checkClasses(page, ['CS 288-102', 'CS 332-008', 'CS 356-H02', 'CS 301-006']);
	});

	test("create valid commuting schedule with commuting hours", async ({ page }) => {
		// Adds the classes
		await addClasses(page, ["CS288", "CS332", "CS356", "CS301"]);
		
		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text=Commuter");
		await page.fill("input[placeholder='2']", "4");

		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(1000); // TODO: Change to when the organizer completes

		// Check correct sections have been selected
		await page.click("text=Sections");

		await checkClasses(page, ['CS 288-008', 'CS 332-012', 'CS 356-102', 'CS 301-008']);
	});

	test("cannot create schedule when a class conflicts with all other classes", async ({ page }) => {
		// Adds the classes
		const classes = ["CHEM 236", "MTEN 201"];
		await addClasses(page, ["CHEM 236", "MTEN 201"]);
		
		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(1000); // TODO: Change to when the organizer completes

		// Check no sections have been selected
		await page.click("text=Sections");
		
		await checkNoClasses(page, classes);
	});

});
