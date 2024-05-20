import { sectionsCollection } from '$lib/mongoClient';

export async function GET({ url }) {
	let page = url.searchParams.get('page') || 0;
	let cursor, pipline;
	const termsPerPage = 20;
	pipline = [
		{
			$group: {
				_id: '$TERM'
			}
		},
		{
			$project: {
				_id: 0,
				TERM: '$_id',
				count: 1
			}
		},
		{
			$sort: {
				TERM: -1
			}
		}
	];

	try {
		cursor = await sectionsCollection
			.aggregate(pipline)
			.limit(termsPerPage)
			.skip(termsPerPage * page)
			.toArray();
	} catch (e) {
		console.error(e);
		return new Response('Error querying database', { status: 500 });
	}

	return new Response(JSON.stringify({ courses: cursor }), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
