import type { IPlan, ICourse, ISection } from './interfaces/Plans';
import type { IFilter } from './interfaces/Filters';
import { searchCourses } from './search';
import { queryString } from '$lib/filterStore';
import { get } from 'svelte/store';
import { uuidv4 } from '$lib/uuidv4';

import { planStore } from '$lib/planStore';

export async function optimizePlan(classes : string[], term: string, filters : IFilter[]) : Promise<IPlan | undefined> {
	const start = Date.now();
	// Gets the sections of the selected classes
	const courses = await getCourses(classes, term, filters);

	if(!courses) {
		console.log("cannot create a valid schedule with those filters");
		return;
	}

	console.log("courses", courses);

	const searchTime = Date.now(); 

	// Generate all possible schedule combinations as plans
	const allPossiblePlans = generatePlans(courses, term);

	if(allPossiblePlans.length == 0) {
		console.log("no valid schedules can be made!")
		return;
	}

	const planTime = Date.now();

	console.log(allPossiblePlans);

	planStore.update((plans) => {
		plans.push(allPossiblePlans[0]);
		return plans;
	});
	
	// Rank the plans using ratePlan.ts	
	const bestPlan = findBestPlan(allPossiblePlans);	
	
	const rankTime = Date.now();


	// FIX: performance monitoring
	console.log(`Searching for courses: ${(searchTime - start) / 1000}s`);
	console.log(`Generating plans: ${(planTime - searchTime) / 1000}s`);
	console.log(`Ranking plans: ${(rankTime - planTime) / 1000}s`);
	console.log(`Total time: ${(rankTime - start) / 1000}s`);
	
	// FIX: temporary visualization of the best plan
	planStore.update((plans) => {
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
	const courses = {};

	// Searches for each course
	for(const c of classes) {
		const courseResponse = await searchCourses(c, term, filter_query);

		// No valid schedule for that course, so abort early
		if(courseResponse.length == 0) return;

		const course = courseResponse[0];
		courses[course.label] = course.meta;
	}

	// TODO: filter the sections

	return courses;
}

//function filterSections() {
//	// TODO:
//}

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

		// The current plan has a conflict, so void it
		if(!verifySections(currSectionList)) continue;

		// Converts it to a plan (TODO: maybe do this later?)
		plans.push(convertSectionListToPlan(currSectionList, term, courses));

		// Decrements the pointer to each section
		// Resets the decrements the next one after it loops
		let pointer = indexes.length - 1;
		indexes[pointer]--;
		while(indexes[pointer] < 0) {
			indexes[pointer] = sectionCounts[pointer];
			pointer--;
			indexes[pointer]--;
		}
	}

	return plans;
}

// Verifies if a specific plan does not have any conflicts with itself
function verifySections(sections : ISections[]) : boolean {
	// Check for class conflicts
	// TODO: 
	
	return true;
}

// Rates and finds the best plan out of an array of plans
function findBestPlan(plans : IPlan[]) : IPlan {
	return plans[0];
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
		name: `Optimized Plan` // TODO: change this name? 
	};

	return plan;
}
