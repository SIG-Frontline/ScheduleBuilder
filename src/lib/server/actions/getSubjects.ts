"use server";

/**
 *
 * @param term the term the limit the search to - in the form of a number like 202210
 * @returns a list of subjects for the term
 */
export async function getSubjects(term: number) {
  if (!term) {
    return { error: "term is required" };
  }
  const baseURL = `${process.env.SBCORE_URL}`;
  const URL = `${baseURL}/subjects/${term}`;
  const data = fetch(URL)
    .then((res) => res.json())
    .then((data) => data.subjects)
    return data
    .catch((err) => {
      console.error(err);
      return [];
    });
}
