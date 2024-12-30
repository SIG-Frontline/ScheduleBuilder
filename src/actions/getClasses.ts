"use server";

export async function getClasses(term: number, subject: string) {
  const URL = `https://generalssb-prod.ec.njit.edu/BannerExtensibility/internalPb/virtualDomains.stuRegCrseSchedCourseNumbs?term=${term}&subject=${subject}`;
  const response = await fetch(URL);
  const data = await response.json();
  console.log("fetching data");
  return data;
}
