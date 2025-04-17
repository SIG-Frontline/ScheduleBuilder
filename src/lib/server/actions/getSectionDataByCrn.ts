"use server";

import { SectionDocument, Time } from "../mongoClient";
//TODO: Change this so that it's not just using the URL
/**
 * 
 * @param url the url from the browser window containing the query parameters 
 * @returns an array of courses  
 */
export async function getSectionDataByCrn(
  url: string,
) {
  try {
    const baseURL = `${process.env.SBCORE_URL}`;
    const URL = `${baseURL}/bulk-crns?${url}`;
    console.log(`My url is: ${URL}`);
    // const URL = `${baseURL}/bulk-crns?term=${term}`;
    const response = await fetch(URL, { method: "GET" });
    
    if (!response.ok) {
      console.error("API URL: ", URL);
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const responseData = await response.json();

    // Creating an array of crns to find selected sections
    // In the query parameters, CRNs which have a key ending in 't' are sections that are selected
    const crns: string[] = [];
    const params = new URLSearchParams(url.substring(1));
    for(const [key, value] of params.entries()) {
      if(key.startsWith("crn") && key.endsWith("t")){
        crns.push(value);
      }
    }   
    console.log("crn values: ", crns)
    responseData.forEach(course => {
      if (!course) {
        throw new Error("Invalid response structure: 'course' field missing.");
      } 
      // Replace _id with code
      course.code = course._id;
      delete course._id;

      // Format sections
      course.sections = course.sections.map(
        (section: SectionDocument) => ({
          instructor: section.INSTRUCTOR ?? "",
          sectionNumber: section.SECTION ?? "",
          status: section.STATUS ?? "Unknown",
          currentEnrollment: section.NOW ?? 0,
          maxEnrollment: section.MAX ?? 0,
          is_honors: section.IS_HONORS ?? false,
          is_async: section.IS_ASYNC ?? false,
          crn: section.CRN ?? "",
          comments: section.COMMENTS ?? "",
        instructionType: section.INSTRUCTION_METHOD ?? "",
          
          meetingTimes: (section.TIMES || []).map((time: Time) => ({
            day: time.day,
            startTime: time.start,
            endTime: time.end,
            building: time.building,
            room: time.room,
          })),
          selected: crns.includes(section.CRN)
        })
      );

    });
    
    return responseData;
  } catch (err) {
    console.error("Error fetching section data:", err);
    return [];
  }
}