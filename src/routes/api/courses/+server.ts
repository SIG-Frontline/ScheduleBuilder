import { coursesCollection } from '$lib/mongoClient';

export async function GET({ url }) {
	const query = {};
	const searchParams = url.searchParams;
	let page = 0;
	const coursesPerPage = 20;
	if (searchParams.has('id')) {
		addSubstrSearch(query, '_id', searchParams.get('id') as string);
	}
	if (searchParams.has('subject')) {
		addSubstrSearch(query, 'subject', searchParams.get('subject') as string);
	}
	if (searchParams.has('number')) {
		addSubstrSearch(query, 'course_number', searchParams.get('number') as string);
	}
	if (searchParams.has('prereq')) {
		addSubstrSearch(query, 'prereq_str', searchParams.get('prereq') as string);
	}
	if (searchParams.has('page')) {
		page = parseInt(searchParams.get('page') as string);
	}

	let cursor, totalNumCourses;
	try {
		cursor = await coursesCollection
			.find(query)
			.limit(coursesPerPage)
			.skip(coursesPerPage * page)
			.toArray();
		totalNumCourses = await coursesCollection.countDocuments(query);
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
