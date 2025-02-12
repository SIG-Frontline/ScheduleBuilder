"use server"

import { Plan, Section, MeetingTime } from "@/lib/client/planStore";

export interface optimizerSettings {
	isCommuter: boolean; // If the user is a commuter
	commuteTimeHours: number; // The time it takes to commute to campus in hours
}

// Extra logging information for timing purposes
let verifyTime = 0;
let testTime = 0;
let convertTime = 0;

/**
 *
 * @param classes A list of class strings in the form of "CS 100"
 * @param filters A list of Filters to apply to the search (to match the same filters as the search bar)
 * @param settings A list of settings to apply to the optimizer
 * @returns A Plan object with the most optimal schedule generated based on the 'ratePlan' function, undefined if none can be generated with the given inputs
 */ 
export async function optimizePlan(currentPlan: Plan, settings: optimizerSettings) : Promise<Plan | undefined> {
	// FIX: logging
	console.log("\nStarting optimizer...");
	const start = Date.now();

	// Generate all possible schedule combinations as plans
	const allPossiblePlans = generatePlans(currentPlan);
	const end1 = Date.now();
	console.log((end1 - start) / 1000, "s to generate plans total");
	console.log("\t", verifyTime / 1000, "s to verify plans");
	console.log("\t", testTime / 1000, "s to test plans");
	console.log("\t", convertTime / 1000, "s to convert plans");

	if(allPossiblePlans.length == 0) {
		console.log("no valid schedules can be made")
		return;
	}

	// Rank the plans using ratePlan.ts	
	const bestPlan = findBestPlan(allPossiblePlans, settings);	
	const end2 = Date.now();
	console.log((end2 - end1) / 1000, "s to rate plans");
	
	console.log((Date.now() - start)/1000, "s in total\n");

	// Return most optimal schedule
	return bestPlan;
}

// Creates every possible combination of plans 
// Filters out any plan that has classes that conflict
function generatePlans(plan: Plan) : Plan[] {
	const plans : Plan[] = [];

	const sectionCounts: number[] = []; // A static list of indexes to reset the indexes
	const indexes : number[] = []; // A list of indexes to create the combinations

	let total = 1;

	const courses = plan.courses;

	if(!courses) {
		console.log("no courses selected");
		return [] as Plan[];
	}

	// TODO: filter sections that interfere with events before generating plans (which can lead to massive speedups)

	// Starts all the indexes at the last section in each course's list
	for(const course of Object.values(courses)) {
		indexes.push(course.sections.length - 1);
		sectionCounts.push(course.sections.length - 1);
		total *= course.sections.length;
	}	

	console.log(total, "possible schedules");

	// Loops through the total amount of combinations
	for (let i = 0; i < total; i++) {
		
		// Creates a section list based on the current indexes
		const selectedSectionsList : Section[] = [];
	 	const selectedSections = {} as {[key: string]: string};
		let i = 0;

		const s = Date.now();
		for(const course of Object.values(courses)) {
			selectedSectionsList.push(course.sections[indexes[i]]);
			selectedSections[Object.values(courses)[i].code] = selectedSectionsList[i].sectionNumber;
			i++;
		}
		const e = Date.now();
		testTime += e - s;

		// Decrements the pointer to each section
		// Resets the decrements the next one after it loops
		let pointer = indexes.length - 1;
		indexes[pointer]--;
		while(indexes[pointer] < 0) {
			indexes[pointer] = sectionCounts[pointer];
			pointer--;
			indexes[pointer]--;
		}

		// If the currently made plan has a class time conflict, void it
		const start = Date.now();
		if(!verifySections(selectedSectionsList)) continue;
		const end = Date.now();
		verifyTime += end - start;

		// Converts it to a plan and stores it to be ranked
		const s2 = Date.now();
		plans.push(convertSectionListToPlan(plan, selectedSections));
		const e2 = Date.now();
		convertTime += e2 - s2;

	}

	return plans;
}

// Verifies if a specific plan does not have any classes that conflict
function verifySections(sections: Section[]) : boolean {
	// Compares every section
	for(let i = 0; i < sections.length - 1; i++) {
		const section1 = sections[i];
		for(let j = i + 1; j < sections.length; j++) {
			const section2 = sections[j];

			// Compares their meeting times
			for(let u = 0; u < section1.meetingTimes.length; u++) {
				for(let v = 0; v < section2.meetingTimes.length; v++) {
					const meeting1: MeetingTime = section1.meetingTimes[u];
					const meeting2: MeetingTime = section2.meetingTimes[v];
					
					// Not on the same day
					if(meeting1.day != meeting2.day) continue;

					// Checks if the two times overlap
					const start1 = new Date(meeting1.startTime);
					const start2 = new Date(meeting2.startTime);
					const end1 = new Date(meeting1.endTime);
					const end2 = new Date(meeting2.endTime);

					if(start1 < end2 && end1 > start2) return false;
				}
			}

		}
	}
	
	return true;
}

// Converts a dictionary of selected sections into a copy of the current plan, with different sections selected
function convertSectionListToPlan(currentPlan: Plan, sectionList: {[key: string]: string}) : Plan {

	// Copies the current plan
	// FIX: this is where most of the time is spent, so if you're trying to optimize this start here
	const newPlan = JSON.parse(JSON.stringify(currentPlan)) as Plan;

	// Selects the sections as given in sectionList	
	for (const [courseCode, section] of Object.entries(sectionList)) {
		const course = newPlan.courses?.find((c) => c.code == courseCode);
		course?.sections.forEach((s) => s.selected = s.sectionNumber == section);
	}

	return newPlan;
}

// Rates and finds the best plan out of an array of plans
function findBestPlan(plans: Plan[], settings: optimizerSettings) : Plan {
	let bestScore = 999999999;
	let bestPlan = {} as Plan;

	// Ranks all plans to determine which has the smallest score
	for(const plan of plans) {
		const score = ratePlan(plan, settings);
		if(score == -1) continue;

		if(score < bestScore) {
			bestScore = score;
			bestPlan = plan;
		}
	}

	return bestPlan; 
}

// Converts a Date to time in minutes since midnight
function convertToMinutes(time: Date) : number {
	return time.getHours() * 60 + time.getMinutes();
}

// Converts the NJIT day scheme to an index (0 = Sunday)
function convertDayToIndex(day: string) : number {
	switch (day) {
		case 'U':
			return 0;
		case 'M':
			return 1;
		case 'T':
			return 2;
		case 'W':
			return 3;
		case 'R':
			return 4;
		case 'F':
			return 5;
		case 'S':
			return 6;
		default:
			return -1;
	}
}

function ratePlan(plan: Plan, settings: optimizerSettings) : number {
	const earliestStart = [1440, 1440, 1440, 1440, 1440, 1440, 1440]; // 60 minutes * 24 hours = 1440 minutes
	const latestEnd = [0, 0, 0, 0, 0, 0, 0];

	// Make sure there's courses in the plan
	if(!plan.courses || plan.courses.length == 0) return -1;
	
	for(const course of plan.courses) {
		let section;

		// Gets the selected section for that course
		for(const s of course.sections) {
			if(s.selected) section = s;
		}
		if(!section) continue;

		// Loops through each meeting of that day
		for(const meeting of section.meetingTimes) {
			// Gets the start and end time and sees if it earlier/later than our currently stored start/end time for that day
			const start = convertToMinutes(new Date(meeting.startTime));	
			const end = convertToMinutes(new Date(meeting.endTime));

			const index = convertDayToIndex(meeting.day);			

			earliestStart[index] = Math.min(earliestStart[index], start);
			latestEnd[index] = Math.max(latestEnd[index], end);
		}
	}

	// Adds together the "time on campus" for a metric on how "good" the class is
	let timeOnCampus = 0;
	
	for (let i = 0; i < 7; i++) {
		const diff = latestEnd[i] - earliestStart[i];
		if(diff < 0) continue; // No classes on that day
	
		timeOnCampus += diff;

		// Compensate for commute time (+3 hours each day on campus)
		if (settings.isCommuter) timeOnCampus += (settings.commuteTimeHours * 60);
	}

	return timeOnCampus;
}
