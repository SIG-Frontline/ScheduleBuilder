import { test, expect, Page } from "@playwright/test";

// FIX: these tests are not completely working because playwright is wonk, so take these results with a grain of salt

async function checkClasses(page: Page, sections: string[]) {
	for(const s of sections) {
		const name = s.split('-')[0];

		await page.getByRole('button', { name: `${name}` }).click();

		const radioMenuLocator = page.getByRole('radio', {name: s});
		await expect(radioMenuLocator).toBeChecked({timeout: 10000});
	}
}

// Tests an imported plan for the specific filters
async function checkImportedPlan(page: Page, file: string, course: string, section: string, truthy: boolean) {
	// Import a test plan 
	const fileChooserPromise = page.waitForEvent('filechooser');
	await page.click("button:has-text('Import Plan')");
	const fileChooser = await fileChooserPromise;
	await fileChooser.setFiles(__dirname + `/test_plans/${file}.json`);
	
	// Runs the organizer
	await page.click("text=Organizer");
	await page.click("text='Find Best Schedule'");

	await page.waitForTimeout(500);

	await page.click("text=Sections");

	// Checks if the proper item was selected
	await page.getByRole('button', { name: course }).click();

	const radioMenuLocators = await page.getByRole('radio', {name: section}).all()
	let checked = false;

	for(const radioMenuLocator of radioMenuLocators) {
		if(await radioMenuLocator.isChecked()) checked = true;
	}

	// Whether that item should have been selected or not
	if(truthy) {
		await expect(checked).toBeTruthy();
	} else {
		await expect(checked).toBeFalsy();
	}
}

test.describe("organizer", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("localhost:3000");
	});

	test("no plan error", async ({ page }) => {
		// Runs the organizer without creating a plan
		await page.click("text=Organizer");
		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(500);

		await expect(page.getByText("No plan could be generated!")).toBeVisible();
	});

	test("no classes selected error", async ({ page }) => {
		// Creates an empty plan
		await page.click("button:has-text('New Plan')");
		await page.fill("input[placeholder='Enter Plan Name']", "Test Plan");
		await page.click("input[placeholder='Select Term']");
		await page.click("text=S\' 2025");
		await page.click("button:has-text('Create')");
		
		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(500);
		
		await expect(page.getByText("No plan could be generated!")).toBeVisible();
	});

	test("give correct schedule when only one exists", async ({ page }) => {
		// Import a plan with no possible schedules that can be made
		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.click("button:has-text('Import Plan')");
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(__dirname + '/test_plans/OnlyOneSchedule.json');
		
		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(500);

		// Check correct sections have been selected
		await page.click("text=Sections");

		await checkClasses(page, ['CHE 260-002', 'CHEM 236-002', 'MATH 225-102', 'EVSC 416-002']);
	});

	test("no schedules when a class is in conflict with all other classes", async ({ page }) => {
		// Import a plan with no possible schedules that can be made
		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.click("button:has-text('Import Plan')");
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(__dirname + '/test_plans/NoPossibleSchedules.json');
		
		// Runs the organizer
		await page.click("text=Organizer");
		await page.click("text='Find Best Schedule'");

		await page.waitForTimeout(500);

		await expect(page.getByText("No plan could be generated!")).toBeVisible();
	});

	test.describe("course filters", () => {
		test("specific instructor for course", async ({page}) => {
			await checkImportedPlan(page, 'CSPlanInstructor', 'CS 332', 'Naik, Kamlesh', true);
		});

		test("online course", async ({page}) => {
			await checkImportedPlan(page, 'CSPlanOnline', 'COM 313', 'COM 313-4', true);
		});

		test("in person course", async ({page}) => {
			await checkImportedPlan(page, 'CSPlanInPerson', 'COM 313', 'COM 313-4', false);
		});

		test("allow honors course", async ({page}) => {
			await checkImportedPlan(page, 'CSPlanHonors', 'CS 301', 'CS 301-H', true);
		});

		test("deny honors course", async ({page}) => {
			await checkImportedPlan(page, 'CSPlanNoHonors', 'CS 301', 'CS 301-H', false);
		});

		test("specific section for course", async ({page}) => {
			await checkImportedPlan(page, 'CSPlanSection', 'CS 288', 'CS 288-008', true);
		});

	});

});
