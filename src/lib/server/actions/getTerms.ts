"use server";
/**
 *
 * @returns a list of terms
 */
export async function getTerms() {
  const baseURL = `http://0.0.0.0:${process.env.PORT}`;
  const URL = `${baseURL}/api/terms`;
  const data = fetch(URL)
    .then((res) => res.json())
    .then((data) => data.courses)
    .then((courses) => {
      const terms = courses.map((course: { TERM: number }) => course.TERM);
      return terms;
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
  return data;
}
