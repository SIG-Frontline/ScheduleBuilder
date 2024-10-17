import { courseCache, type CourseDocument } from "$lib/mongoClient";

export async function GET( {url} ) {
    let courseC = courseCache.getCourses();

    let res = "";
    (await courseC).forEach((course : CourseDocument) => {
        res = res + (JSON.stringify(course));
    });


     return new Response(String(res), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

    


}