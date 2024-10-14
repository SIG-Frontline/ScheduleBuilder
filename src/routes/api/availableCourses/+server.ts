import { courseCache, sectionsCollection, type CourseDocument, type ReqTree } from '$lib/mongoClient';
import { check_prereq } from '$lib/apiUtils.js';
import type { RequestEvent } from './$types';
import { get_static_data } from '$lib/apiUtils.js';

//http://localhost:XXXX/api/availableCourses?taken=CS100
export async function GET( {url} ) {
   const query = {};
    const searchParams = url.searchParams;
    console.log("here");

    // add a seach param for Major
    if (searchParams.has('taken')) {
        const takenClasses = searchParams.get('taken')?.split('|');
        console.log(takenClasses?.toString());
        const availableClasses = await getAvailableClasses(takenClasses);
        /*
        return new Response(JSON.stringify({ availableClasses }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        */
        return new Response(takenClasses?.toString(), { status: 200 });
    } 
    const noPrereqClasses = await getAvailableClasses(); 
    return new Response(JSON.stringify({ noPrereqClasses }), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200
    });
}

//Returns the classes that are available with the classes taken
//If takenClassses is undefined then returns all classes with no prereqs
async function getAvailableClasses(takenClasses?: string[]) {
    
    const static_courses: CourseDocument[] = await courseCache.getCourses();

    //Filter Rutgers courses 
    const rutgers_regex = /^R\d{3}/;
    const NJITCourses = static_courses.filter((course) => {
        return !rutgers_regex.test(course._id); 
    });

    if(takenClasses == null){
        return NJITCourses.filter(course => course.tree === null);
     }

    const courseMap = new Map<string, CourseDocument>();
    NJITCourses.forEach(course => {
        courseMap.set(course._id, course);  
    });

   //console.log(static_courses);
    console.log("here");
    console.log(courseMap.get('CS 100'));

    
    //Getch course tree, invert the tree, filter by prereq


    return "oof";
}
