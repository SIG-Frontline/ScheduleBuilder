import { sectionsCollection } from '$lib/mongoClient';
import { check_prereq } from '$lib/apiUtils.js';
import type { RequestEvent } from './$types';

//http://localhost:XXXX/api/availableCourses?taken=CS100
export async function GET( {url} ) {
   const query = {};
    const searchParams = url.searchParams;
    console.log("here");

    // add a seach param for Major
    if (searchParams.has('taken')) {
        const takenClasses = searchParams.get('taken')?.split('|');
        /*
        const availableClasses = await getAvailableClasses(takenClasses);
        return new Response(JSON.stringify({ availableClasses }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        */
        return new Response(takenClasses?.toString(), { status: 200 });
    }

    return new Response('Missing required parameter: taken', { status: 400 });
}


async function getAvailableClasses(takenClasses: string[]) {
    //Getch course tree, invert the tree, filter by prereq
}
