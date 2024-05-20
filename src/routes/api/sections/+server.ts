import { sectionsCollection } from '$lib/mongoClient';

export async function GET({ url }) {
	const query = {};
	const searchParams = url.searchParams;
	let page = 0;
	let sectionsPerPage = 20;

	if (searchParams.has('term')) {
		addIntSearch(query, 'TERM', searchParams.get('term') as string);
	}
	if (searchParams.has('course')) {
		addSubstrSearch(query, 'COURSE', searchParams.get('course') as string);
	}
	if (searchParams.has('title')) {
		addSubstrSearch(query, 'TITLE', searchParams.get('title') as string);
	}
	if (searchParams.has('subject')) {
		addSubstrSearch(query, 'SUBJECT', searchParams.get('subject') as string);
	}
	if (searchParams.has('instructor')) {
		addSubstrSearch(query, 'INSTRUCTOR', searchParams.get('instructor') as string);
	}
	if (searchParams.has('honors')) {
		addBooleanSearch(query, 'IS_HONORS', searchParams.get('honors') as string);
	}
	if (searchParams.has('async')) {
		addBooleanSearch(query, 'IS_ASYNC', searchParams.get('async') as string);
	}
	if (searchParams.has('credits')) {
		addIntSearch(query, 'CREDITS', searchParams.get('credits') as string);
	}
	if (searchParams.has('level')) {
		addIntSearch(query, 'COURSE_LEVEL', searchParams.get('level') as string);
	}
	if (searchParams.has('summer')) {
		addIntSearch(query, 'SUMMER_PERIOD', searchParams.get('summer') as string);
	}
	if (searchParams.has('method')) {
		addSubstrSearch(query, 'INSTRUCTION_METHOD', searchParams.get('method') as string);
	}

	let cursor, totalNumCourses;
	try {
		cursor = await sectionsCollection
			.find(query)
			.limit(sectionsPerPage)
			.skip(sectionsPerPage * page)
			.toArray();
		totalNumCourses = await sectionsCollection.countDocuments(query);
	} catch (e) {
		console.error(e);
		return new Response('Error querying database', { status: 500 });
	}

	return new Response(JSON.stringify({ courses: cursor, totalNumCourses }), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

function addSubstrSearch(query: any, key: string, value: string) {
	query[key] = { $regex: `.*${value}.*`, $options: 'i' };
}

function addBooleanSearch(query: any, key: string, value: string) {
	query[key] = { $eq: value === 'true' };
}
function addIntSearch(query: any, key: string, value: string) {
	query[key] = { $eq: value };
}
