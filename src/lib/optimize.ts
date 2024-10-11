import type { IPlan, ICourse, ISection, IMeeting } from './interfaces/Plans';
import type { IFilter } from './interfaces/Filters';
import { searchCourses } from './search';
import { queryString } from '$lib/filterStore';
import { get } from 'svelte/store';
import { uuidv4 } from '$lib/uuidv4';

import { planStore } from '$lib/planStore';
import { ratePlan } from './ratePlan';

export async function optimizePlan(classes : string[], term: string, filters : IFilter[]) : Promise<IPlan | undefined> {
	const start = Date.now();
	// Gets the sections of the selected classes
	const courses = await getCourses(classes, term, filters);

	if(!courses) {
		console.log("cannot create a valid schedule with those filters");
		return;
	}

	const searchTime = Date.now(); 

	// Generate all possible schedule combinations as plans
	const allPossiblePlans = generatePlans(courses, term);

	if(allPossiblePlans.length == 0) {
		console.log("no valid schedules can be made!")
		return;
	}

	const planTime = Date.now();

	// Rank the plans using ratePlan.ts	
	const bestPlan = findBestPlan(allPossiblePlans);	
	
	const rankTime = Date.now();


	// FIX: performance monitoring
	console.log(`Searching for courses: ${(searchTime - start) / 1000}s`);
	console.log(`Generating plans: ${(planTime - searchTime) / 1000}s`);
	console.log(`Ranking plans: ${(rankTime - planTime) / 1000}s`);
	console.log(`Total time: ${(rankTime - start) / 1000}s`);
	
	// FIX: TEMPORARY, adds the best plan to the plans tab
	planStore.update((plans) => {
		bestPlan.name = `Optimized plan ${plans.length + 1}`;
		plans.push(bestPlan);
		return plans;
	});

	// Return most optimal schedule
	return bestPlan;
}

// Searches for each course, storing an array of their sections
async function getCourses(classes: string[], term: string, filters: IFilter[]) : Promise<{[key: string]: ISection[]} | undefined> {
	
	// Gets the filters from the "filter" section
	const filter_query = get(queryString);
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
function generatePlans(courses : {[key: string]: ISection[]}, term: string) : IPlan[] {
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

		// Converts it to a plan (TODO: maybe do this later in the process?) and stores it
		plans.push(convertSectionListToPlan(currSectionList, term, courses));
	}

	return plans;
}

// Verifies if a specific plan does not have any conflicts with itself
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
function findBestPlan(plans : IPlan[]) : IPlan {
	let bestScore = 999999999;
	let bestPlan = {} as IPlan;

	// Loops through all plans to determine which has the smallest score
	for(const plan of plans) {
		const score = ratePlan(plan, false); // TODO: fix commuter stuff
		if(score < bestScore) {
			bestScore = score;
			bestPlan = plan;
		}
	}

	return bestPlan; 
}

// Converts a list of selected sections into a proper IPlan that the schedule builder can use
function convertSectionListToPlan(sections : ISections[], term: string, allCourseSections : {[key: string]: ISection[]}) : IPlan {
	// Makes a list of the selected sections
	const selectedSectionList: {[key: string]: string} = {};

	for(const section of Object.values(sections)) {
		selectedSectionList[section["COURSE"]] = section["SECTION"];
	}

	// Adds all the courses in the proper format
	const courses : ICourse[] = [];

	for(const [courseName, sectionList] of Object.entries(allCourseSections)) {
		const course : ICourse = {
			sections: sectionList,
			course: courseName,
			selectedSection: selectedSectionList[courseName],
		}		
		courses.push(course);
	}

	// Creates the final plan
	const plan = {
		active: false,
		courses: courses, 
		term: term,
		id: uuidv4(),
		name: `Optimized Plan`
	};

	return plan;
}
