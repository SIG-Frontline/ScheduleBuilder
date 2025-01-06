"use server";

export async function getSubjects(term: number) {
  const URL = `http://localhost:3000/api/subjects/?term=${term}`;
  const data = fetch(URL)
    .then((res) => res.json())
    .then((data) => data.subjects)
    .then((subjects) => {
      const subjectIds = subjects.map(
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
