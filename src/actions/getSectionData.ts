"use server";

export async function getSectionData(
  term: number,
  subject: string,
  courseCode: string
) {
  const URL = `http://localhost:3000/api/courses?term=${term}&course=${
    subject + " " + courseCode
  }`;
  const data = fetch(URL)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      return data;
    })

    .catch((err) => {
      console.error(err);
      return [];
    });

  return data;
}
