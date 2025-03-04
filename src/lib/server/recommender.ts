
"use server"

import { getCurricula } from "./actions/getCurricula"
import { check_prereq } from "./apiUtils";
import { CurriculaDocument } from "./mongoClient";

type ClassRecommendations = ClassGroup | ClassRecStr | ClassRecObj;

type ClassGroup = {
	name: string;  // the group title
	numCredits: number; // the number of credits required for the group
	numClasses: number; // the number of classes required for the group
	operator: string; // the operator of this group
	classes: ClassRecommendations[]; // a list of class recommendations of that group
}

type ClassRecStr = {
	course: string; // the course code
}

type ClassRecObj = {
	name: string; // the name of the class 
	course: string; // the course code
}

/**
 * Accepts the user's current degree, major, and catalog year, as well as a list of courses taken to give them a list of recommended classes to take
 *
 * @param degree A degree to search for, like "BS", "BA", etc.
 * @param major A major to search for, like "CS", "CHE", "BIS", etc.
 * @param catalogYear The year the degree was started, like "2025"
 * @param takenCourses A list of courses in the format "CS 100"
 * @returns A tree structure containing the recommended classes and their groups they are with
 *
 */
export async function getRecommendedClasses(degree: string, major: string, catalogYear: string, takenCourses: string[]) : Promise<ClassRecommendations[]> { 

	// Queries the database 
	const curricula = await getCurricula(degree, major, catalogYear) as CurriculaDocument;

	if(!curricula) {
		console.error(degree, major, catalogYear, 'is not in the database!');
	}

	// Gets a list of all possible courses required for a degree
	const allCourses = await parseBasicClasses(curricula.classes, takenCourses);

	// Filters all those courses to only have ones satisfies by the takenCourses
	const filteredCourses = [] as string[];
	for(const course of allCourses) {
		if(await check_prereq(course, takenCourses)) filteredCourses.push(course);
	}

	// Remove already taken courses from the list
	const courseList = filteredCourses.filter((c) => !takenCourses.includes(c));

	// Rebuilds the recommendation tree with the classes
	// TODO: prevent classes from double dipping by removing them from them from the takenCourses
	// TODO: handle wildcard courses
	const recommendations = parseClasses(curricula.classes, takenCourses, courseList);

	return recommendations;
}

// GENERATING CLASS LIST \\

function parseBasicClasses(node: string[] | string, takenCourses: string[]) : string[] {
	let neededClasses = [] as string[];
	for(const classTree of node) neededClasses = neededClasses.concat(parseBasicClassTree(classTree, takenCourses));
	return neededClasses;
}

function parseBasicClassTree(node: string[] | string, takenCourses: string[]) : string[] {
	// Required singular classes (not in a particular group), which have an object associated with them
	if(node["name"]) return [node["course"]];
	
	// Singular class (mostly in electives), return it as an array of that class to be concatted later
	if(typeof(node) === "string") return [node];

	// Parses the condition statements
	// Returns the parsed array that is relevant to its condition
	if(node[0] == "$COND") {
		// Checks each condition and returns the class list if true
		for (let i = 1; i < node.length - 1; i+=2) {
			const condition = parseCondition(node[i], takenCourses);
			if(condition) return parseBasicClasses(node[i + 1], takenCourses);
		}

		// Return the else part
		return parseBasicClasses(node[node.length - 1], takenCourses);
	}

	// Parse the class groups 
	let classes = [] as string[];
	for (let i = 4; i < node.length; i++) classes = classes.concat(parseBasicClassTree(node[i], takenCourses));

	return classes;
}

// REBUILDING RECOMMENDATION TREE \\

// Flattens a parse tree into class recommendations
function parseClasses(node: string[] | string, takenCourses: string[], courseList: string[]) : ClassRecommendations[] {
	let neededClasses = [] as ClassRecommendations[];
	for(const classTree of node) neededClasses = neededClasses.concat(parseClassTree(classTree, takenCourses, courseList));
	return neededClasses;
}

function parseClassTree(node: string[] | string, takenCourses: string[], courseList: string[]) : ClassRecommendations[] {
	// Required singular classes (not in a particular group), which have an object associated with them
	if(node["name"] && courseList.includes(node["course"])) return [node as unknown as ClassRecObj];
	
	// Singular class (mostly in electives), return it as an array of that class to be concatted later
	if(typeof(node) === "string" && courseList.includes(node)) return [{course: node} as ClassRecStr];

	// Parses the condition statements
	// Returns the parsed array that is relevant to its condition
	if(node[0] == "$COND") {
		// Checks each condition and returns the class list if true
		for (let i = 1; i < node.length - 1; i+=2) {
			const condition = parseCondition(node[i], takenCourses);
			if(condition) return parseClasses(node[i + 1], takenCourses, courseList);
		}

		// Return the else part
		return parseClasses(node[node.length - 1], takenCourses, courseList);
	}

	// Parse the class groups 
	if(node[0] && node[0] == "&") {
		const c = { 
			name: node[3] as string, 
			numCredits: node[2] as unknown as number, 
			numClasses: node[1] as unknown as number, 
			operator: node[0] as string, 
			classes: [] as ClassRecommendations[]
		} as ClassGroup;
		let classes = [] as ClassRecommendations[];

		// Checks if all classes were parsed out, satisfying the & condition
		for (let i = 4; i < node.length; i++) classes = classes.concat(parseClassTree(node[i], takenCourses, courseList));
		if(classes.length == 0) return [];

		c["classes"] = classes;
		return [c];
	} else if(node[0] && node[0] == "|") {
		// TODO: remove if any class is satisfied
		const c = { 
			name: node[3] as string, 
			numCredits: node[2] as unknown as number, 
			numClasses: node[1] as unknown as number, 
			operator: node[0] as string, 
			classes: [] as ClassRecommendations[]
		} as ClassGroup;
		let classes = [] as ClassRecommendations[];

		// Checks if any of the conditions were parsed out, satisfying the | condition
		for (let i = 4; i < node.length; i++) {
			const classSubset = parseClassTree(node[i], takenCourses, courseList);
			// Something was parsed out
			if(classSubset.length == 0) return [];
			classes = classes.concat(classSubset);
		}

		c["classes"] = classes;
		return [c];
	}

	// Default to nothing, meaning the case wasn't handled or the class was parsed out
	return [];
}

// Parses a condition based on the user's taken courses 
function parseCondition(condition: string | string[], takenCourses: string[]) : boolean {
	// Simple condition
	if(typeof(condition) === "string") {
		const pattern = /(.*) WAS (FOUND|PASSED)/;

		const match = condition.match(pattern);
		if(!match) return false; // no defined behavior in the pattern

		// Removes the spaces between the taken courses to match the way degreeworks creates the conditions
		return takenCourses.map(str => str.replace(/\s/g, '')).includes(match[1]);
	}

	// Complex condition
	const operator = condition[0];
	if(operator == "&") {
		return parseCondition(condition[1], takenCourses) && parseCondition(condition[2], takenCourses);
	} else if(operator == "|") {
		return parseCondition(condition[1], takenCourses) || parseCondition(condition[2], takenCourses);
	}

	return false;
}
