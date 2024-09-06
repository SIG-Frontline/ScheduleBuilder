// Import the sectionsCollection from the mongoClient
import { addQuery } from '$lib/apiUtils.js';
import { sectionsCollection } from '$lib/mongoClient';

// Define an asynchronous GET function that takes a request object as a parameter
export async function GET({ url }) {
	// Initialize an empty query object
	const query = {};
	// Extract the search parameters from the url
	const searchParams = url.searchParams;
	// Initialize page and sectionsPerPage variables
	const page = 0;
	const sectionsPerPage = 20;

	// Check if the search parameters include 'term' and add it to the query
	if (searchParams.has('term')) {
		addQuery(query, 'TERM', searchParams.get('term') as string);
	}
	// Repeat the process for other potential search parameters
	if (searchParams.has('course')) {
		addQuery(query, 'COURSE', searchParams.get('course') as string);
	}
	if (searchParams.has('title')) {
		addQuery(query, 'TITLE', searchParams.get('title') as string);
	}
	if (searchParams.has('subject')) {
		addQuery(query, 'SUBJECT', searchParams.get('subject') as string);
	}
	if (searchParams.has('instructor')) {
		addQuery(query, 'INSTRUCTOR', searchParams.get('instructor') as string);
	}
	if (searchParams.has('honors')) {
		addQuery(query, 'IS_HONORS', searchParams.get('honors') as string);
	}
	if (searchParams.has('async')) {
		addQuery(query, 'IS_ASYNC', searchParams.get('async') as string);
	}
	if (searchParams.has('credits')) {
		addQuery(query, 'CREDITS', searchParams.get('credits') as string);
	}
	if (searchParams.has('level')) {
		addQuery(query, 'COURSE_LEVEL', searchParams.get('level') as string);
	}
	if (searchParams.has('summer')) {
		addQuery(query, 'SUMMER_PERIOD', searchParams.get('summer') as string);
	}
	if (searchParams.has('method')) {
		addQuery(query, 'INSTRUCTION_METHOD', searchParams.get('method') as string);
	}
	// Initialize cursor and totalNumCourses variables
	let cursor, totalNumCourses;
	try {
		// Attempt to get the sections from the sectionsCollection using the query
		// Limit the results to sectionsPerPage and skip the sections for the previous pages
		cursor = await sectionsCollection
			.find(query)
			.limit(sectionsPerPage)
			.skip(sectionsPerPage * page)
			.toArray();
		// Get the total number of documents that match the query
		totalNumCourses = await sectionsCollection.countDocuments(query);
	} catch (e) {
		// Log the error and return a 500 response if there is an error querying the database
		console.error(e);
		return new Response('Error querying database', { status: 500 });
	}

	// Return a response with the courses and totalNumCourses in JSON format
	return new Response(JSON.stringify({ courses: cursor, totalNumCourses }), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
