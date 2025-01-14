"use server";

import { Filters } from "@/lib/filterStore";
import { NextResponse } from "next/server";
/**
 *
 * @param term the term the limit the search to - in the form of a number like 202210
 * @param subject the subject to limit the search to - in the form of a string like "CS"
 * @param filters the filters to apply to the search
 * @returns a list of courses ids (so like CS 100, CS 101, etc) that match the search criteria
 */
export async function getClasses(
  term: number,
  subject: string,
  filters: Filters
) {
  //assuming that there is a term and subject, if there isn't we should throw an error
  if (!term || !subject) {
    return NextResponse.json(
      { error: "term and subject are required" },
      { status: 400 }
    );
  }
  const baseURL = Boolean(process.env.IS_DOCKER)
    ? "http://nextjs-docker:3000"
    : "http://localhost:3000";
  let URL = `${baseURL}/api/course-search?term=${term}&subject=${subject}`;

  //adding url parameters based on the filters
  if (filters.honors) {
    URL += "&honors=true";
  }
  if (filters.graduate) {
    URL += "&level=g";
  }
  if (filters.undergraduate) {
    URL += "&level=u";
  }
  if (filters.creditRange[0] !== 0 || filters.creditRange[1] !== 6) {
    URL += `&credits=${filters.creditRange[0]}|${filters.creditRange[1]}`;
  }
  console.log(URL);

  const data = fetch(URL)
    .then((res) => res.json())
    .then((data) => data.courses)
    .then((courses) => {
      const courseIds = courses.map((course: { _id: string }) => course._id); // this is how we get the course ids from the data
      return courseIds;
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
  return data;
}
