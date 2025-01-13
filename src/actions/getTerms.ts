"use server";
/**
 *
 * @returns a list of terms
 */
export async function getTerms() {
  const URL = `http://localhost:3000/api/terms`;
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
