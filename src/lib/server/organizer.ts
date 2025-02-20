"use server"

import { Plan, MeetingTime } from "@/lib/client/planStore";

export interface organizerSettings {
	isCommuter: boolean; // If the user is a commuter
	commuteTimeHours: number; // The time it takes to commute to campus in hours
}

let verifyTime = 0;
let testTime = 0;

/**
 * Accepts a plan to organize and settings which to operate on. This will then return the list of sections which spends the least amount of time on campus and does not conflict with itself.
 *
 * @param currentPlan The currently selected plan to organize
 * @param settings A list of settings to apply to the organizer
 * @returns A Plan object with the most optimal schedule generated based on the 'rateSections' function, undefined if none can be generated with the given inputs
 */ 
export async function organizePlan(currentPlan: Plan, settings: organizerSettings) : Promise<Plan | undefined> {
	verifyTime = 0;
	testTime = 0;

	// Copy the plan so we can modify some values without changing the underlying data
	const copyPlan = JSON.parse(JSON.stringify(currentPlan)) as Plan;

	// Modify all meeting time strings to be epoch time for much easier math (and avoid multiple conversions with Date)
	copyPlan.courses?.forEach(c => c.sections.forEach(s => s.meetingTimes.forEach(m => {
		m.startTime = new Date(m.startTime).getHours() * 60 + new Date(m.startTime).getMinutes();
		m.endTime = new Date(m.endTime).getHours() * 60 + new Date(m.endTime).getMinutes();
	})))

	console.log("\nStarting optimizer...");
	const start = Date.now();
	// Generate all possible schedule combinations as plans
	const allPossibleSectionCombos = generateCombos(copyPlan);
	const end1 = Date.now();

	console.log((end1 - start) / 1000, "s to generate plans total");
	console.log("\t", verifyTime / 1000, "s to verify plans");
	console.log("\t", testTime / 1000, "s to test plans");
	
	if(allPossibleSectionCombos.length == 0) {
		console.log("no valid schedules can be made")
		return;
	}

	// Rank the plans using rateSections()
	const bestSections = findBestSections(allPossibleSectionCombos, copyPlan, settings);	
	const bestPlan = convertSectionListToPlan(currentPlan, bestSections);
	const end2 = Date.now();
	console.log((end2 - end1) / 1000, "s to rate plans");
	console.log((Date.now() - start)/1000, "s in total\n");

	// Return most optimal schedule
	return bestPlan;
}

// Creates every possible combination of plans 
// Filters out any plan that has classes that conflict
function generateCombos(plan: Plan) : {[key: string]: string}[] {
	const selectedSectionsCombo = [] as {[key: string]: string}[];

	const sectionCounts: number[] = []; // A static list of indexes to reset the indexes
	const indexes : number[] = []; // A list of indexes to create the combinations

	let total = 1;

	const courses = plan.courses;

	if(!courses || courses.length == 0) {
		console.log("no courses selected");
		return [];
	}

	// TODO: filter sections that interfere with events before generating plans (which can lead to massive speedups)
	
	const hasOnline: {[key: string]: boolean} = {};
	
	for(const course of courses) {

		// Remove extra online sections while generating
		// If a course has 10 online sections, it might as well only have 1
		for(let i = 0; i < course.sections.length; i++) {
			const s = course.sections[i];

			if(s.meetingTimes.length == 0) {
				if(!hasOnline[course.code]) {
					hasOnline[course.code] = true;
				} else {
					course.sections.splice(i, 1);
					i--;
				}
			}
		}

		// Starts all the indexes at the last section in each course's list
		indexes.push(course.sections.length - 1);
		sectionCounts.push(course.sections.length - 1);
		total *= course.sections.length;
	}	

	console.log(total, "possible schedules");

	// Loops through the total amount of combinations
	for (let i = 0; i < total; i++) {
		
		// Creates a section map of "class code": "section number" based on the current indexes
	 	const selectedSections = {} as {[key: string]: string};

		// Store the meeting times as a flat array to check if any overlap
		const meetings = [] as MeetingTime[];

		const s = Date.now();
		let v = 0;
		for(const course of courses) {
			course.sections[indexes[v]].meetingTimes.forEach(m => meetings.push(m));
			selectedSections[courses[v].code] = course.sections[indexes[v]].sectionNumber;
			v++;
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
		if(!verifyMeetings(meetings)) continue;
		const end = Date.now();
		verifyTime += end - start;

		// Converts it to a plan and stores it to be ranked
		selectedSectionsCombo.push(selectedSections);

	}

	return selectedSectionsCombo;
}

// Verifies if a list of MeetingTimes do not conflict with each other
function verifyMeetings(meetings: MeetingTime[]) : boolean {
	// Compares every MeetingTime to every other MeetingTime
	for(let i = 0; i < meetings.length - 1; i++) {
		const meeting1 = meetings[i];
		for(let j = i + 1; j < meetings.length; j++) {
			const meeting2 = meetings[j];

			// Compares their meeting times
					
			// Not on the same day
			if(meeting1.day != meeting2.day) continue;

			// Checks if the two times overlap
			const start1 = meeting1.startTime;
			const start2 = meeting2.startTime;
			const end1 = meeting1.endTime;
			const end2 = meeting2.endTime;

			if(start1 < end2 && end1 > start2) return false;

		}
	}
	
	return true;
}

// Converts a map of "class code": "section number" into a copy of the current plan, with the proper sections selected
function convertSectionListToPlan(currentPlan: Plan, sectionList: {[key: string]: string}) : Plan {

	// Copies the current plan
	const newPlan = JSON.parse(JSON.stringify(currentPlan)) as Plan;

	// Selects the sections as given in sectionList	
	for (const [courseCode, section] of Object.entries(sectionList)) {
		const course = newPlan.courses?.find((c) => c.code == courseCode);
		course?.sections.forEach((s) => s.selected = s.sectionNumber == section);
	}

	return newPlan;
}

// Rates and finds the best plan out of an list of section lists
function findBestSections(allSectionLists: {[key: string]: string}[], plan: Plan, settings: organizerSettings) : {[key: string]: string} {
	let bestScore = 999999999;
	let bestSectionList = {} as {[key: string]: string};

	// Ranks all plans to determine which has the smallest score
	for(const sectionList of allSectionLists) {
		const score = rateSections(sectionList, plan, settings);
		if(score == -1) continue;

		if(score < bestScore) {
			bestScore = score;
			bestSectionList = sectionList;
		}
	}

	return bestSectionList; 
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

function rateSections(sectionList: {[key: string]: string}, plan: Plan, settings: organizerSettings) : number {
	const earliestStart = [1440, 1440, 1440, 1440, 1440, 1440, 1440]; // 60 minutes * 24 hours = 1440 minutes
	const latestEnd = [0, 0, 0, 0, 0, 0, 0];

	// Make sure there's courses in the plan
	if(!plan.courses || plan.courses.length == 0) return -1;
	
	for(const course of plan.courses) {
		let section;

		// Gets the selected section for that course
		for(const s of course.sections) {
			if(sectionList[course.code] == s.sectionNumber) section = s;
		}
		if(!section) continue;

		// Loops through each meeting of that day
		for(const meeting of section.meetingTimes) {
			// Gets the start and end time and sees if it earlier/later than our currently stored start/end time for that day
			const start = meeting.startTime;
			const end = meeting.endTime;

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

		// Compensate for commute time
		if (settings.isCommuter) timeOnCampus += (settings.commuteTimeHours * 60);
	}

	return timeOnCampus
}
