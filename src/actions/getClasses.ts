"use server";

import { Filters } from "@/lib/filterStore";

export async function getClasses(
  term: number,
  subject: string,
  filters: Filters
) {
  let URL = `http://localhost:3000/api/course-search?term=${term}&subject=${subject}`;
  if (filters.honors) {
    URL += "&honors=true";
  }
  console.log(URL);

  const data = fetch(URL)
    .then((res) => res.json())
    .then((data) => data.courses)
    .then((courses) => {
      const courseIds = courses.map((course: { _id: string }) => course._id);
      return courseIds;
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
  return data;
}
