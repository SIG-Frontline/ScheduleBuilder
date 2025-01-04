"use server";

export async function getSubjects(term: number) {
  const URL = `http://localhost:3000/api/subjects/${term}`;
  const response = await fetch(URL);
  const data = await response.json();
  console.log("fetching data");
  return data;
}
