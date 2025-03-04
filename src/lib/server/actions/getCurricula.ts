"use server";

import { CurriculaDocument } from "../mongoClient";

/**
 *
 * @param degree A degree to search for, like "BS", "BA", etc.
 * @param major A major to search for, like "CS", "CHE", "BIS", etc.
 * @param catalogYear The year the degree was started, like "2025"
 * @returns a degree that matches the search criteria
 */
export async function getCurricula(
  degree: string,
  major: string,
  catalogYear: string,
) {
  // Assumes there is a degree, major, and catalog year to be searched (as this uniquely identifies a curriculum)
  if (!degree || !major || !catalogYear) {
    return {
      error: "degree, major and catalogYear are required",
    };
  }
  const baseURL = `http://0.0.0.0:${process.env.PORT}`;
  const URL = `${baseURL}/api/degree?degree=${degree}&major=${major}&year=${catalogYear}`;

  const data = await fetch(URL)
    .then((res) => res.json())
    .then((data) => data.curricula[0])
    .catch((err) => {
      console.error(err);
      return [];
    });

	const curricula = {
		school: data.SCHOOL,
		degree: data.DEGREE,
		major: data.MAJOR,
		catalogYear: data.YEAR,
		classes: data.CLASSES,
	} as CurriculaDocument;

  return curricula;
}
