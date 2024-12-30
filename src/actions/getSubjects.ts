"use server";

export async function getSubjects(term: number) {
  const URL = `https://generalssb-prod.ec.njit.edu/BannerExtensibility/internalPb/virtualDomains.stuRegCrseSchedSubjList?term=${term}`;
  const response = await fetch(URL);
  const data = await response.json();
  return data;
}
