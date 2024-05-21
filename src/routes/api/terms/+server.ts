// https://kit.svelte.dev/docs/routing#server
// Import the sectionsCollection from the mongoClient module
import { sectionsCollection } from '$lib/mongoClient';

// Define an asynchronous GET function that takes a request object as a parameter
export async function GET({ url }) {
	// Extract the 'page' query parameter from the URL, defaulting to 0 if it's not provided
	let page = url.searchParams.get('page') || 0;
	let cursor, pipline;
	const termsPerPage = 20; // Define the number of terms to be returned per page

	// Define the MongoDB aggregation pipeline
	pipline = [
		{
			$group: {
				_id: '$TERM' // Group documents by the 'TERM' field
			}
		},
		{
			$project: {
				_id: 0, // Exclude the '_id' field from the output documents
				TERM: '$_id', // Include the 'TERM' field in the output documents
				count: 1 // Include a 'count' field in the output documents
			}
		},
		{
			$sort: {
				TERM: -1 // Sort the output documents in descending order by the 'TERM' field
			}
		}
	];

	try {
		// Execute the aggregation pipeline against the sectionsCollection
		// Limit the number of output documents to 'termsPerPage'
		// Skip 'termsPerPage' * 'page' documents to implement pagination
		cursor = await sectionsCollection
			.aggregate(pipline)
			.limit(termsPerPage)
			.skip(termsPerPage * page)
			.toArray();
	} catch (e) {
		// If an error occurs, log it to the console and return a 500 response
		console.error(e);
		return new Response('Error querying database', { status: 500 });
	}

	// If the query is successful, return the results as a JSON response
	return new Response(JSON.stringify({ courses: cursor }), {
		headers: {
			'Content-Type': 'application/json' // Set the 'Content-Type' header to 'application/json'
		}
	});
}
