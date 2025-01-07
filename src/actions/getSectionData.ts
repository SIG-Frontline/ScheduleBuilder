"use server";

/*

export type Course = {
  title: string; - yes
  code: string; - yes
  description: string;         - NO
  prerequisites: string[];    - NO
  credits: number; - yes
  sections: Section[]; - yes
};

export type Section = {
  meetingTimes: MeetingTime[];
  instructor: string;
  seats: number;
  CRN: string;
  currentEnrollment: number;
  status: string;
  is_honors: boolean;
  is_async: boolean;
};
export type MeetingTime = {
  day: string;
  startTime: string;
  endTime: string;
  building: string;
  room: string;
};
*/

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
      return data.courses[0];
    })
    .then((course) => {
      //replace the _id key with the "code" key
      course.code = course._id;
      delete course._id;
      course.sections = course.sections.map((section) => {
        section.instructor = section.INSTRUCTOR;
        delete section.INSTRUCTOR;
        section.section = section.SECTION;
        delete section.SECTION;
        section.status = section.STATUS;
        delete section.STATUS;
        section.currentEnrollment = section.NOW;
        delete section.NOW;
        section.maxEnrollment = section.MAX;
        delete section.MAX;
        section.is_honors = section.IS_HONORS;
        delete section.IS_HONORS;
        section.is_async = section.IS_ASYNC;
        delete section.IS_ASYNC;
        section.crn = section.CRN;
        delete section.CRN;
        section.comments = section.COMMENTS;
        delete section.COMMENTS;
        section.meetingTimes = section.TIMES.map((time) => {
          return {
            day: time.day,
            startTime: time.start,
            endTime: time.end,
            building: time.building,
            room: time.room,
          };
        });
        delete section.TIMES;
        return section;
      });

      return course;
    })

    .catch((err) => {
      console.error(err);
      return [];
    });

  return data;
}
