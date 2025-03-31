"use server";

import { ClassRecommendation } from "../apiUtils";

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
export async function getRecommendedClasses(degree: string, major: string, year: string, takenCourses: string[]) : Promise<ClassRecommendation[]|{error: string}> {
	if(!degree || !major || !year || !takenCourses) {
		return { error: "degree, major, year, or takenCourses must be assigned a value" }
	}

	const baseURL = `${process.env.SBCORE_URL}`;
	const URL = `${baseURL}/recommender`

	console.log(URL);
	const data = fetch(URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ degree, major, year, takenCourses })
	}).then((res) => res.json())

	// Check if the data is correct
	return data;
}
