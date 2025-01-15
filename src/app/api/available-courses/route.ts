import {
  courseCache,
  type CourseDocument,
  type ReqTree,
} from "@/lib/mongoClient";
import { check_tree } from "@/lib/apiUtils";
import { NextRequest } from "next/server";

//http://localhost:XXXX/api/availableCourses?taken=CS100
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // TODO: add a seach param for Major
  if (searchParams.has("taken")) {
    const takenClasses = searchParams.get("taken")?.split("|");
    console.log(takenClasses?.toString());
    const availableClasses = await getAvailableClasses(takenClasses);

    return new Response(JSON.stringify(availableClasses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const noPrereqClasses = await getAvailableClasses();

  return new Response(JSON.stringify({ noPrereqClasses }), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
  });
}

function invertTree(possible_prereqs: Map<string, null | string[]>) {
  const out = new Map<string, null | string[]>();

  for (const [k, v] of possible_prereqs.entries()) {
    if (v == null) continue;
    for (const i in v) {
      if (!out.has(v[i])) out.set(v[i], []);
      out.get(v[i])?.push(k);
    }
  }
  return out;
}

async function flattenTree(tree: null | string | string[] | ReqTree) {
  if (tree == null) return null;

  const courses: string[] = [];

  if (typeof tree === "string") {
    courses.push(tree);
    return courses;
  }

  for (const i in tree) {
    if (Array.isArray(tree[i])) {
      const flatTree = await flattenTree(tree[i]);

      if (flatTree != null) courses.push(...flatTree);
    } else if (tree[i] != "|" && tree[i] != "&") courses.push(tree[i]);
  }

  return courses;
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

  if (takenClasses == null) {
    return NJITCourses.filter((course) => course.tree === null);
  }

  const courseMap = new Map<string, CourseDocument>();
  NJITCourses.forEach((course) => {
    courseMap.set(course._id, course);
  });

  const possible_prereqs = new Map<string, null | string[]>();
  for (const [k, v] of courseMap.entries()) {
    const branch = await flattenTree(v.tree);
    possible_prereqs.set(k, branch);
  }

  const possible_available_classes = invertTree(possible_prereqs);

  //filter courses
  const availableClasses: string[] = [];

  const checked_courses = new Set<string>();

  for (const i in takenClasses) {
    const currCourse = possible_available_classes.get(takenClasses[i]);
    for (const j in currCourse) {
      const courseName = currCourse[Number(j)];
      const currCourseTree = courseMap.get(courseName)?.tree;
      if (currCourseTree == null) continue;

      if (
        !checked_courses.has(currCourse[Number(j)]) &&
        check_tree(currCourseTree, takenClasses)
      )
        availableClasses.push(courseName);
      checked_courses.add(courseName);
    }
  }

  const availableCourses = static_courses.filter((course) =>
    availableClasses.includes(course._id)
  );

  return availableCourses;
}
