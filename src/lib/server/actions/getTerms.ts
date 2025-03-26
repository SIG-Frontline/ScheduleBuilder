"use server";
/**
 *
 * @returns a list of terms
 */
export async function getTerms() {
  const baseURL = `${process.env.SBCORE_URL}`;
  const URL = `${baseURL}/terms`;
  const data = fetch(URL)
    .then((res) => res.json())
    .then((data) => data.terms)
    return data
    .catch((err) => {
      console.error(err);
      return [];
    });
  return data;
}
