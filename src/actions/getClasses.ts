"use server";

export async function getClasses(term: number, subject: string) {
  const URL = `http://localhost:3000/api/course-search?term=${term}&subject=${subject}`;
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
