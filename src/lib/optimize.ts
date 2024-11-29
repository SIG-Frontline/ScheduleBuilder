import type { IPlan, ISection, IMeeting } from './interfaces/Plans';
import type { IFilter } from './interfaces/Filters';
import { ratePlan } from './ratePlan';

import { searchCourses } from './search';
import { queryString } from '$lib/filterStore';
import { get } from 'svelte/store';
import { planStore } from './planStore';
import { termStore } from '$lib/termStore';
import { uuidv4 } from '$lib/uuidv4';

// Takes in a list of course name strings, filters, and a commuter boolean (for rating the plan)
// Outputs the schedule with the lowest score using the rating from ratePlan.ts
// Outputs undefined if no schedule can be made/found
export async function optimizePlan(classes : string[], filters : IFilter[], isCommuter : boolean) : Promise<IPlan | undefined> {
	// FIX: logging for the generator
	const start = Date.now();

	// Gets the sections of the selected classes
	const courses = await getCourses(classes, filters);

	if(!courses) {
		console.log("cannot search for a better schedule with those filters");
		return;
	}

	// Generate all possible schedule combinations as plans
	const allPossiblePlans = generatePlans(courses);

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

// Searches for each course, storing an array of their sections
async function getCourses(classes: string[], filters: IFilter[]) : Promise<{[key: string]: ISection[]} | undefined> {
	
	// Gets the filters from the "filter" section
	const filter_query = get(queryString);
	const term = get(termStore).toString();
	const courses : {[key: string]: ISection[] }= {};

	// Searches for each course
	for(const c of classes) {
		const courseResponse = await searchCourses(c, term, filter_query);

		// No valid schedule for that course, so abort early
		if(courseResponse.length == 0) return;

		const course = courseResponse[0];
		const courseName : string = course.label;
		const sections : ISection[] = course.meta;

		const filteredSections = filterSections(filters, sections);

		// No valid sections for that course, so abort early
		if(filteredSections.length == 0) return;

		courses[courseName] = filteredSections;
	}

	return courses;
}

// Filters out sections that do not follow the filters
// NOTE: this could possible be made into a mongodb query
// This was also not properly tested
function filterSections(filters: IFilter[], sections: ISection[]) : ISection[] {
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
// Filters out any plan that has class conflicts with itself
function generatePlans(courses : {[key: string]: ISection[]}) : IPlan[] {
	const plans : IPlan[] = [];

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
		const currSectionList : ISection[] = [];
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

		const plan = {
			active: false,
			sections:currSectionList,
			term: get(termStore).toString(),
			id: uuidv4(),
			name: `Optimized Plan`
		};

		// Converts it to a plan and stores it
		plans.push(plan);
	}

	return plans;
}

// Verifies if a specific plan does not have any conflicts with itself
// This could possibly be optimized by sorting
function verifySections(sections : ISection[]) : boolean {
	// Compares every section
	for(let i = 0; i < sections.length - 1; i++) {
		const section1 = sections[i];
		for(let j = i + 1; j < sections.length; j++) {
			const section2 = sections[j];

			// Compares their meeting times
			for(let u = 0; u < section1.TIMES.length; u++) {
				for(let v = 0; v < section2.TIMES.length; v++) {
					const meeting1: IMeeting = section1.TIMES[u];
					const meeting2: IMeeting = section2.TIMES[v];
					
					// Not on the same day
					if(meeting1.day != meeting2.day) continue;

					// Checks if the two times overlap
					const start1 = new Date(meeting1.start);
					const start2 = new Date(meeting2.start);
					const end1 = new Date(meeting1.end);
					const end2 = new Date(meeting2.end);

					if(start1 < end2 && end1 > start2) return false;
					
				}
			}

		}
	}
	
	return true;
}

// Rates and finds the best plan out of an array of plans
function findBestPlan(plans : IPlan[], isCommuter : boolean) : IPlan {
	let bestScore = 999999999;
	let bestPlan = {} as IPlan;

	// Loops through all plans to determine which has the smallest score
	for(const plan of plans) {
		const score = ratePlan(plan, isCommuter);
		if(score < bestScore) {
			bestScore = score;
			bestPlan = plan;
		}
	}

	return bestPlan; 
}

