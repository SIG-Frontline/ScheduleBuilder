// Import the courses collection from the MongoDB client
import { coursesCollection } from '$lib/mongoClient';

// Define an asynchronous GET function that takes a request object as a parameter
export async function GET({ url }) {
	// Initialize an empty query object
	const query = {};
	// Extract the search parameters from the URL
	const searchParams = url.searchParams;
	// Initialize the page number to 0
	let page = 0;
	// Define the number of courses to display per page
	const coursesPerPage = 20;
	// If the search parameters include an 'id', add it to the query
	if (searchParams.has('id')) {
		addSubstrSearch(query, '_id', searchParams.get('id') as string);
	}
	// If the search parameters include a 'subject', add it to the query
	if (searchParams.has('subject')) {
		addSubstrSearch(query, 'subject', searchParams.get('subject') as string);
	}
	// If the search parameters include a 'number', add it to the query
	if (searchParams.has('number')) {
		addSubstrSearch(query, 'course_number', searchParams.get('number') as string);
	}
	// If the search parameters include a 'prereq', add it to the query
	if (searchParams.has('prereq')) {
		addSubstrSearch(query, 'prereq_str', searchParams.get('prereq') as string);
	}
	// If the search parameters include a 'page', update the page number
	if (searchParams.has('page')) {
		page = parseInt(searchParams.get('page') as string);
	}

	// Initialize variables for the cursor and the total number of courses
	let cursor, totalNumCourses;
	try {
		// Query the database with the constructed query, limit the results to the number of courses per page, and skip the courses of the previous pages
		cursor = await coursesCollection
			.find(query)
			.limit(coursesPerPage)
			.skip(coursesPerPage * page)
			.toArray();
		// Count the total number of documents that match the query
		totalNumCourses = await coursesCollection.countDocuments(query);
	} catch (e) {
		// If an error occurs, log it and return a 500 response
		console.error(e);
		return new Response('Error querying database', { status: 500 });
	}

	// Return a response with the courses and the total number of courses, and set the content type to 'application/json'
	return new Response(JSON.stringify({ courses: cursor, totalNumCourses }), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

// Define a function to add a substring search to the query
function addSubstrSearch(query: any, key: string, value: string) {
	// Add a regex search to the query for the given key and value, ignoring case
	query[key] = { $regex: `.*${value}.*`, $options: 'i' };
}
