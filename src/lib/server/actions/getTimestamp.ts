"use server";
/**
 *
 * @returns a list of terms
 */
export async function getTimestamp(timestamp?: string) {
  const baseURL = `${process.env.SBCORE_URL}`;
  let URL = `${baseURL}/timestamp`;
  if (timestamp) {
    URL += `/${timestamp}`;
  }
  const data = fetch(URL)
    .then((res) => res.json())
    .then((data) => data.timestamp)
    return data
    .catch((err) => {
      console.error(err);
      return [];
    });
}

//  if no plan
// getTimestamp()
// // if planselected
// getTimestamp(planSelected term) 
