"use server";
/**
 *
 * @returns a list of terms
 */
export async function getTerms() {
  const baseURL = Boolean(process.env.IS_DOCKER)
    ? "http://nextjs-docker:3000"
    : "http://localhost:3000";
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
