import { courseCache, type CourseDocument } from "$lib/mongoClient";

export async function GET( {url} ) {
    //First retrieves all courses from courseCache located in mongoClient
    let courseC = courseCache.getCourses();

    //Concatenates a stringified json of each course to a res string
    let res = "";
    (await courseC).forEach((course : CourseDocument) => {
        res = res + (JSON.stringify(course));
    });

    //if status is successful, out res
     return new Response(String(res), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

    


}