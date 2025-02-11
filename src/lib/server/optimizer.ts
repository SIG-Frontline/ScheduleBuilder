"use server"

import { Plan, Course, Section, MeetingTime } from "@/lib/client/planStore";
import { Filters } from "@/lib/client/filterStore";
import { getSectionData } from "@/lib/server/actions/getSectionData";

/**
 *
 * @param classes A list of class strings in the form of "CS 100"
 * @param filters A list of Filters to apply to the search (to match the same filters as the search bar)
 * @param isCommuter A boolean to determine if the user is a commuter for ranking purposes
 * @returns A Plan object with the most optimal schedule generated based on the 'ratePlan' function, undefined if none can be generated with the given inputs
 */ 
export async function optimizePlan(classes : string[], filters: Filters, term: number, isCommuter : boolean) : Promise<Plan | undefined> {
	// FIX: logging for the generator
	const start = Date.now();

	if(classes.length == 0 || classes[0] == "") {
		console.log("no classes selected");
		return;
	}

	// Gets the sections of the selected classes (using a similar process to the search bar)
	const courses = await getCourses(classes, filters, term);

	if(!courses) {
		console.log("cannot search for a better schedule with those filters");
		return;
	}

	// Generate all possible schedule combinations as plans
	const allPossiblePlans = generatePlans(courses, term);

	if(allPossiblePlans.length == 0) {
		console.log("no valid schedules can be made")
		return;
	}

	// Rank the plans using ratePlan.ts	
	const bestPlan = findBestPlan(allPossiblePlans, isCommuter);	
	
	// FIX: logging for the generator
	console.log(`Took: ${(Date.now() - start)/1000}s to generate`);

	// Return most optimal schedule
	return bestPlan;
}

// Searches for each course, storing a dictionary of their sections
async function getCourses(classes: string[], filters: Filters, term: number) : Promise<{[key: string]: Section[]} | undefined> {
	const courses : {[key: string]: Section[] }= {};

	// Searches for each course
	for(const c of classes) {
		if(c == "") continue;
		const course = await getSectionData(term, c.split(" ")[0], c.split(" ")[1]);

		// No valid schedule for that course, so abort early
		// TEST: make sure this works
		if(course.length == 0) return;

		const courseName : string = course.title;
		const sections : Section[] = course.sections;

		// TODO: Perform proper filters of the sections
		//const filteredSections = filterSections(filters, sections);
	 	const filteredSections = sections;

		// No valid sections for that course, so abort early
		if(filteredSections.length == 0) return;

		courses[courseName] = filteredSections;
	}

	return courses;
}

// Filters out sections that do not follow the filters
function filterSections(filters: Filters, sections: Section[]) : Section[] {
	const validSections = [];

	// Loops through all meetings and filters to determine if they are valid
	for(const section of sections) {
		let valid = true;
		for(const meeting of section.TIMES) {
			for(const filter of filters) {
					// Not on the same day
					if(meeting.day != filter.day) continue;

					// Checks if the two times overlap
					const start1 = new Date(meeting.start);
					const start2 = new Date(filter.start);
					const end1 = new Date(meeting.end);
					const end2 = new Date(filter.end);

					if(start1 < end2 && end1 > start2) valid = false;
			}
		}

		if(!valid) continue;

		validSections.push(section);
	}

	return validSections;
}

// Creates every possible combination of plans 
// Filters out any plan that has classes that conflict
function generatePlans(courses : {[key: string]: Section[]}, term: number) : Plan[] {
	const plans : Plan[] = [];

	const sectionCounts: number[] = []; // A static list of indexes to reset the indexes
	const indexes : number[] = []; // A list of indexes to create the combinations

	let total = 1;

	// Starts all the indexes at the last section in each course's list
	for(const course of Object.values(courses)) {
		indexes.push(course.length - 1);
		sectionCounts.push(course.length - 1);
		total *= course.length;
	}	

	// Loops through the total amount of combinations
	for (let i = 0; i < total; i++) {
		
		// Creates a section list based on the current indexes
		const currSectionList : Section[] = [];
		let i = 0;
		for(const course of Object.values(courses)) {
			currSectionList.push(course[indexes[i]]);
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
		
		// The current plan has a conflict, so void it
		if(!verifySections(currSectionList)) continue;

		// Converts it to a plan and stores it to be ranked
		plans.push(convertSectionListToPlan(currSectionList, courses, term));
	}

	return plans;
}

// Verifies if a specific plan does not have any classes that conflict
function verifySections(sections : Section[]) : boolean {
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

// Rates and finds the best plan out of an array of plans
function findBestPlan(plans : Plan[], isCommuter : boolean) : Plan {
	let bestScore = 999999999;
	let bestPlan = {} as Plan;

	// Ranks all plans to determine which has the smallest score
	for(const plan of plans) {
		const score = ratePlan(plan, isCommuter);
		if(score == -1) continue;

		if(score < bestScore) {
			bestScore = score;
			bestPlan = plan;
		}
	}

	return bestPlan; 
}

// Converts a list of selected sections into a proper IPlan that the schedule builder can use
function convertSectionListToPlan(sections : Section[], allCourseSections : {[key: string]: Section[]}, term: number) : Plan {
	// Makes a list of the selected sections
	const selectedSectionList: {[key: string]: string} = {};

	// Creaters a dictionary of classes and their selected sections
	for(const section of Object.values(sections)) {
		selectedSectionList[section["COURSE"]] = section["sectionNumber"];
	}

	// Adds all the courses in the proper format
	const courses : Course[] = [];

	// Creates the course object out of those sections
	for(const [courseName, sectionList] of Object.entries(allCourseSections)) {
		// HACK: this is disgusting, but it's the only way I found to not override the original section list
		const selectedSections : Section[] = JSON.parse(JSON.stringify(sectionList))

		// Selects the section for that specific course 
		for(const section of selectedSections) {
			section["selected"] = (section["sectionNumber"] == selectedSectionList[section["COURSE"]]);
		}

		const course : Course = {
			title: courseName,
			code: sectionList[0].COURSE,
			description: "",
			credits: 3,
			sections: selectedSections,
			prerequisites: [],
			color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)},0.9)`,
		}		
		courses.push(course);
	}

	// Creates the final plan
	const plan = {
		uuid: (() => {
			function uuidv4() {
			  return "10000000-1000-4000-8000-100000000000".replace(
				 /[018]/g,
				 (c) =>
					(
					  +c ^
					  (crypto.getRandomValues(new Uint8Array(1))[0] &
						 (15 >> (+c / 4)))
					).toString(16)
			  );
			}
			return uuidv4();
		})(),
		name: "Optimized Plan Test",
		description: "This is an auto-generated optimized plan used for testing",
		term: term,
		selected: false,
		courses: courses,
	}

	return plan;
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

function ratePlan(plan: Plan, isCommute: boolean) : number {
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
		if (isCommute) timeOnCampus += (3 * 60);
	}

	return timeOnCampus;
}
