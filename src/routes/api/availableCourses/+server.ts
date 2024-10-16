import { courseCache, sectionsCollection, type CourseDocument, type ReqTree } from '$lib/mongoClient';
import { check_prereq, check_tree} from '$lib/apiUtils.js';
import type { RequestEvent } from './$types';
import { get_static_data } from '$lib/apiUtils.js';
import type { REPLCommand } from 'repl';

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
        return new Response(JSON.stringify(availableClasses), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } 
    const noPrereqClasses = await getAvailableClasses(); 
    return new Response(JSON.stringify({ noPrereqClasses }), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200
    });
}

function invertTree(possible_prereqs: Map<string, null|string[]>){
    const out = new Map<string, null|string[]>();

    for(const [k,v] of possible_prereqs.entries()){
        if(v == null) continue;
        for( const i in v){
            if (!out.has(v[i])) 
                out.set(v[i],[]);
            out.get(v[i])?.push(k);
        }
    }
    return out;
}

async function flattenTree(tree: null|string|string[]|ReqTree) {
    //console.log(tree);

    if (tree == null) return null;

    const courses: string[] = [];

    if (typeof tree === 'string') {
        courses.push(tree);
        return courses;
    }

    for (const i in tree){
        if (Array.isArray(tree[i])){
            const flatTree = await flattenTree(tree[i]);
            //console.log("FlatTree:", flatTree)
            if(flatTree != null){
                courses.push(...flatTree);
                //console.log("Concat:",courses)
            }

        } else if(tree[i] != '|' && tree[i] !='&')
            courses.push(tree[i]);
        //console.log("BRANCH:",courses);
    }

    return courses

}

//Returns the classes that are available with the classes taken
//If takenClasses is undefined then returns all classes with no prereqs
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
    console.log(courseMap.get('CS 350'));
    
    const possible_prereqs = new Map<string, null|string[]>();
    for(const [k,v] of courseMap.entries()){
        const branch = await flattenTree(v.tree);
        possible_prereqs.set(k,branch);
    }
        
    //invert the tree
    const possible_available_classes = invertTree(possible_prereqs)
    
    //console.log(possible_available_classes);
    
    //filter courses
    const availableClasses: string[] = [];
    
    const checked_courses = new Set<string>();
    
    for (const i in takenClasses){
        const currCourse = possible_available_classes.get(takenClasses[i]);
        for (const j in currCourse){
            const courseName = currCourse[Number(j)];
            const currCourseTree = courseMap.get(courseName)?.tree
            if(currCourseTree == null)
                continue;

            if (courseName == "CS 350"){

                console.log("AHHHHHH")
                console.log(currCourseTree.length)
                console.log(check_tree(currCourseTree,takenClasses))
            }

            if( !checked_courses.has(currCourse[Number(j)]) && check_tree(currCourseTree,takenClasses) )
                availableClasses.push(courseName);
            checked_courses.add(courseName)
        }
    }
    
    return availableClasses;
    
}
