"use server";

export async function getClasses(term: number, subject: string) {
  const URL = `http://localhost:3000/api/course-search?term=${term}&subject=${subject}`;
  const response = await fetch(URL);
  const data = await response.json();
  console.log("fetching data");
  return data;
}
