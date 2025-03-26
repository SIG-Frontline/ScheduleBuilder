"use server";

/**
 *
 * @param term the term the limit the search to - in the form of a number like 202210
 * @param subject the subject to limit the search to - in the form of a string like "CS"
 * @param courseCode the course code to limit the search to - its in rhe form of a string like "CS 100"
 * @returns the data for the course including the sections in an array
 */
export async function getSectionData(
  term: number,
  subject: string,
  courseCode: string
) {
  try {
    const baseURL = `${process.env.SBCORE_URL}`;

    const queryParam = encodeURIComponent(subject && courseCode ? `${subject} ${courseCode}`.trim() : subject);
    
    const URL = `${baseURL}/sections?term=${term}&course=${queryParam}`;
    const response = await fetch(URL, { method: "GET" });
    
    if (!response.ok) {
      console.error("API URL: ", URL);
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const responseData = await response.json();

    if (!responseData.course) {
      throw new Error("Invalid response structure: 'course' field missing.");
    }

    const course = responseData.course;

    // Replace _id with code
    course.code = course._id;
    delete course._id;

    // Format sections
    course.sections = course.sections.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (section: Record<string, any>) => ({
        instructor: section.INSTRUCTOR ?? "",
        sectionNumber: section.SECTION ?? "",
        status: section.STATUS ?? "Unknown",
        currentEnrollment: section.NOW ?? 0,
        maxEnrollment: section.MAX ?? 0,
        is_honors: section.IS_HONORS ?? false,
        is_async: section.IS_ASYNC ?? false,
        crn: section.CRN ?? "",
        comments: section.COMMENTS ?? "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        meetingTimes: (section.TIMES || []).map((time: any) => ({
          day: time.day,
          startTime: time.start,
          endTime: time.end,
          building: time.building,
          room: time.room,
        })),
      })
    );

    return course;
  } catch (err) {
    console.error("Error fetching section data:", err);
    return [];
  }
}