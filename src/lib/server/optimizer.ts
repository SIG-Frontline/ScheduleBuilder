"use server"

import { Plan, Section, MeetingTime } from "@/lib/client/planStore";

export interface optimizerSettings {
	isCommuter: boolean; // If the user is a commuter
	commuteTimeHours: number; // The time it takes to commute to campus in hours
}

/**
 *
 * @param currentPlan The currently selected plan to optimize
 * @param settings A list of settings to apply to the optimizer
 * @returns A Plan object with the most optimal schedule generated based on the 'ratePlan' function, undefined if none can be generated with the given inputs
 */ 
export async function optimizePlan(currentPlan: Plan, settings: optimizerSettings) : Promise<Plan | undefined> {
	// Generate all possible schedule combinations as plans
	const allPossibleSectionCombos = generateCombos(currentPlan);

	if(allPossibleSectionCombos.length == 0) {
		console.log("no valid schedules can be made")
		return;
	}

	// Rank the plans using rateSections()
	const bestSections = findBestSections(allPossibleSectionCombos, currentPlan, settings);	
	const bestPlan = convertSectionListToPlan(currentPlan, bestSections);

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

	if(!courses) {
		console.log("no courses selected");
		return [];
	}

	// TODO: filter sections that interfere with events before generating plans (which can lead to massive speedups)

	// Starts all the indexes at the last section in each course's list
	for(const course of Object.values(courses)) {
		indexes.push(course.sections.length - 1);
		sectionCounts.push(course.sections.length - 1);
		total *= course.sections.length;
	}	

	// Loops through the total amount of combinations
	for (let i = 0; i < total; i++) {
		
		// Creates a section list based on the current indexes
		const selectedSectionsList : Section[] = [];
	 	const selectedSections = {} as {[key: string]: string};
		let i = 0;

		for(const course of Object.values(courses)) {
			selectedSectionsList.push(course.sections[indexes[i]]);
			selectedSections[Object.values(courses)[i].code] = selectedSectionsList[i].sectionNumber;
			i++;
		}

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
		if(!verifySections(selectedSectionsList)) continue;

		// Converts it to a plan and stores it to be ranked
		selectedSectionsCombo.push(selectedSections);

	}

	return selectedSectionsCombo;
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
	const newPlan = JSON.parse(JSON.stringify(currentPlan)) as Plan;

	// Selects the sections as given in sectionList	
	for (const [courseCode, section] of Object.entries(sectionList)) {
		const course = newPlan.courses?.find((c) => c.code == courseCode);
		course?.sections.forEach((s) => s.selected = s.sectionNumber == section);
	}

	return newPlan;
}

// Rates and finds the best plan out of an array of plans
function findBestSections(allSectionLists: {[key: string]: string}[], plan: Plan, settings: optimizerSettings) : {[key: string]: string} {
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

function rateSections(sectionList: {[key: string]: string}, plan: Plan, settings: optimizerSettings) : number {
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
