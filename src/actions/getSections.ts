"use server";

export async function getSections(
  term: number,
  subject: string,
  courseCode: string
) {
  const URL = `http://localhost:3000/api/sections-search?term=${term}&course=${
    subject + " " + courseCode
  }`;
  const data = fetch(URL)
    .then((res) => res.json())
    
    .catch((err) => {
      console.error(err);
      return [];
    });
  console.log(data);

  return data;
}
