// "use server";

import { Filters } from "@/lib/client/filterStore";
import { addQuery } from "@/lib/server/apiUtils";
import { sectionsCollection } from "@/lib/server/mongoClient";
/**
 * This is the function that gets the classes from the mongo database based on the term, subject, and any given filters
 * @param term  The term to get classes for
 * @param subject  The subject to get classes for
 * @param filters  The filters to apply to the classes
 * @returns  The result of the query (cursor) and the total number of courses that match the query
 */
export async function getClassesFn(
  term: number,
  subject: string,
  filters: Filters
): Promise<{ cursor: string[]; totalNumCourses: number }> {
  //first validate the term and subject
  if (!term || !subject) {
    return {
      cursor: [],
      totalNumCourses: 0,
    };
  }
  //create the query object
  const query = {};
  //add the term and subject to the query
  addQuery(query, "TERM", term.toString(), true);
  addQuery(query, "SUBJECT", subject);
  //add the filters to the query
  if (filters.honors) {
    addQuery(query, "IS_HONORS", "true");
  }
  if (filters.graduate) {
    addQuery(query, "COURSE_LEVEL", "range!5|7");
  }
  if (filters.undergraduate) {
    //if the subject is ARCH, then the course level should be 1-5 because ARCH is a 5 year program and includes 500 level courses
    if (subject === "ARCH") {
      addQuery(query, "COURSE_LEVEL", "range!1|5");
    } else {
      addQuery(query, "COURSE_LEVEL", "range!1|4");
    }
  }
  if (filters.creditRange[0] !== 0 || filters.creditRange[1] !== 6) {
    addQuery(
      query,
      "CREDITS",
      `range!${filters.creditRange[0]}|${filters.creditRange[1]}`
    );
  }
  let cursor, totalNumCourses;
  const pipeline = [
    // aggregate the sections collection
    { $match: query },
    { $sort: { COURSE: 1 } },
    {
      $group: {
        _id: "$COURSE",
      },
    },
  ];
  try {
    // Attempt to get the sections from the sectionsCollection using the query
    // Limit the results to sectionsPerPage and skip the sections for the previous pages
    cursor = await sectionsCollection.aggregate(pipeline).toArray();
    totalNumCourses = cursor.length;
    cursor = cursor.map((course) => course._id);
  } catch (err) {
    console.error(err);
    return {
      cursor: [],
      totalNumCourses: 0,
    };
  }
  return { cursor, totalNumCourses };
}
