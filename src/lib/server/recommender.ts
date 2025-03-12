"use server"

import { getCurricula } from "./actions/getCurricula"
import { check_prereq } from "./apiUtils";
import { ClassRecNode, CurriculaDocument } from "./mongoClient";

export type ClassRecommendations = ClassRec | ClassBranch;

export type ClassRec = {
	name?: string; 				// the name of the class 
	type: ClassRecType.CLASS; 	// the type of this recommendation
	course: string; 			// the course code (CS 100)
	legacy?: boolean; 			// whether this is legacy (no longer available)
}

export type ClassBranch = {
	name: string;  					 	// name of the branch/section/group
	type: ClassRecType.BRANCH; 			// the type of this recommendation 
	numCredits?: number; 				// how many credits are required
	numClasses?: number; 				// how many classes are required
	operator: string; 					// & or | 
	classes: ClassRecommendations[]; 	// the recommendations that belong to this group
}

enum ClassRecType {
	BRANCH = 'branch',
	CLASS = 'class',
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

	if(!curricula || curricula.error) {
		console.error(degree, major, catalogYear, 'is not in the database!');
		return [] as ClassRecommendations[];
	}

	// Gets a list of all possible courses required for a degree, minus the ones already taken
	// Gives a copied list because it is modified to keep track of double dipping classes
	const copyList = [...takenCourses];
	const allNeededCourses = await parseClassesForStringList(curricula.classes, copyList);
	console.log("unused classes", copyList);

	// Filters all those courses to only have ones satisfies by the takenCourses
	const filteredCourses = [] as string[];
	for(const course of allNeededCourses) {
		if(await check_prereq(course, takenCourses)) {
			filteredCourses.push(course);
		}
	}

	// Rebuilds the recommendation tree with the classes
	// TODO: handle classes that can appear in more than 1 section, and they should go in one section rather than another
	// Ex. STS 376 can satisfy the Social Science/Management or History Humanities 300. If a student already has Social Sciences met, STS 376 will still show up there
	const recommendations = parseClassesForRecommendations(curricula.classes, takenCourses, filteredCourses);

	return recommendations;
}

// GENERATING CLASS LIST \\

function parseClassesForStringList(node: ClassRecNode[], takenCourses: string[]) : string[] {
	let neededClasses = [] as string[];
	for(const classTree of node) neededClasses = neededClasses.concat(parseTreeForStringList(classTree, takenCourses));
	return neededClasses;
}

function parseTreeForStringList(node: ClassRecNode, takenCourses: string[]) : string[] {
	// Required class
	if('course' in node) {
		// We found a spot for this course, so remove it so we don't double dip it
		if(takenCourses.includes(node.course)) {
			takenCourses.splice(takenCourses.indexOf(node.course), 1);
			return [];
		}

		// Handles wildcards, removing them if they are satisfied
		if(node.course.includes("@")) {
			const c = validateWildcard(node.course, takenCourses);
			if(c != "") {
				takenCourses.splice(takenCourses.indexOf(c), 1);
				return [];
			}
		}

		return [node.course];
	}

	// Parses the condition statements
	// Returns the parsed array that is relevant to its condition
	if(node[0] == "$COND") {
		// Checks each condition and returns the class list if true
		for (let i = 1; i < node.length - 1; i+=2) {
			const condition = parseCondition(node[i] as string[], takenCourses);
			if(condition) return parseClassesForStringList(node[i + 1] as ClassRecNode[], takenCourses);
		}

		// Return the else part
		return parseClassesForStringList(node[node.length - 1] as ClassRecNode[], takenCourses);
	}

	// Parse the class groups 
	if(node[0] && node[0] == "&") {
		let classes = [] as string[];
		for (let i = 4; i < node.length; i++) classes = classes.concat(parseTreeForStringList(node[i] as ClassRecNode[], takenCourses));
		return classes; // Will return [] if all classes were taken, removing the entire AND section
	} else if (node[0] && node[0] == "|") {
		let classes = [] as string[];
		for (let i = 4; i < node.length; i++) {
			const classesSubset = parseTreeForStringList(node[i] as ClassRecNode[], takenCourses);
			if(classesSubset.length == 0) return []; // If any class was taken, remove the entire OR section
			classes = classes.concat(classesSubset);
		}
		return classes;
	}

	// Not handled (shouldn't be any)
	return [];
}

// REBUILDING RECOMMENDATION TREE \\

// Flattens a parse tree into class recommendations
function parseClassesForRecommendations(node: ClassRecNode[], takenCourses: string[], courseList: string[]) : ClassRecommendations[] {
	let neededClasses = [] as ClassRecommendations[];
	for(const classTree of node) neededClasses = neededClasses.concat(parseTreeForRecommendations(classTree, takenCourses, courseList));
	return neededClasses;
}

function parseTreeForRecommendations(node: ClassRecNode, takenCourses: string[], courseList: string[]) : ClassRecommendations[] {
	// Required class
	if('name' in node && courseList.includes(node.course)) {

		// Do not recommend legacy classes
		if (node.legacy) return [];

		const c = node as ClassRec;
		c.type = ClassRecType.CLASS;
		return [c];
	}

	// Parses the condition statements
	// Returns the parsed array that is relevant to its condition
	if(Array.isArray(node) && node[0] == "$COND") {
		// Checks each condition and returns the class list if true
		for (let i = 1; i < node.length - 1; i+=2) {
			const condition = parseCondition(node[i] as string[], takenCourses);
			if(condition) return parseClassesForRecommendations(node[i + 1] as ClassRecNode[], takenCourses, courseList);
		}

		// Return the else part
		return parseClassesForRecommendations(node[node.length - 1] as ClassRecNode[], takenCourses, courseList);
	}

	// Parse the class groups 
	if(Array.isArray(node) && node[0]) {
		const c = { 
			name: node[3] as string, 
			type: ClassRecType.BRANCH,
			numCredits: node[2] as unknown as number,
			numClasses: node[1] as unknown as number, 
			operator: node[0] as string, 
			classes: [] as ClassRecommendations[]
		} as ClassBranch;
		let classes = [] as ClassRecommendations[];

		for (let i = 4; i < node.length; i++) classes = classes.concat(parseTreeForRecommendations(node[i] as ClassRecNode[], takenCourses, courseList));
		// If all classes were satisfied for that group, remove it
		if(classes.length == 0) return [];

		c.classes = classes;
		return [c];
	}

	// Default to nothing, meaning the case wasn't handled or the class was parsed out
	return [];
}

// Parses a condition based on the user's taken courses 
function parseCondition(condition: string[] | string, takenCourses: string[]) : boolean {
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
	if(operator == "&") return parseCondition(condition[1], takenCourses) && parseCondition(condition[2], takenCourses);
	else if(operator == "|") return parseCondition(condition[1], takenCourses) || parseCondition(condition[2], takenCourses);

	return false;
}

// Valids a wildcard class, like 'CS 3@', from a list of takenCourses
function validateWildcard(wildcard: string, takenCourses: string[]) {
	// Turns the wildcard into a regex pattern
	const wildcardPattern = wildcard.replaceAll("@", "(.*)");

	// Returns the first course that matches the wildcard
	for(const course of takenCourses) {
		if(course.match(wildcardPattern)) {
			return course;
		}
	}

	return "";
}
