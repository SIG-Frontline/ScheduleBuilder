"use server";

import { NextResponse } from "next/server";

/**
 *
 * @param term the term the limit the search to - in the form of a number like 202210
 * @returns a list of subjects for the term
 */
export async function getSubjects(term: number) {
  if (!term) {
    return NextResponse.json({ error: "term is required" }, { status: 400 });
  }
  const baseURL = Boolean(process.env.IS_DOCKER)
    ? "http://nextjs-docker:3000"
    : "http://localhost:3000";
  const URL = `${baseURL}/api/subjects/?term=${term}`;
  const data = fetch(URL)
    .then((res) => res.json())
    .then((data) => data.subjects)
    .then((subjects) => {
      const subjectIds = subjects.map(
        // this is how we get the subject ids from the data
        (course: { SUBJECT: string }) => course.SUBJECT
      );
      return subjectIds;
    })

    .catch((err) => {
      console.error(err);
      return [];
    });
  return data;
}
