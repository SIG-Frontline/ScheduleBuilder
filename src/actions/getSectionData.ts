"use server";

import { NextResponse } from "next/server";

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
  if (!term || !subject || !courseCode) {
    return NextResponse.json(
      { error: "term, subject, and courseCode are required" },
      { status: 400 }
    );
  }
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
      course.sections = course.sections.map(
        //format the data for each section and make it match the schema... this is a bit of a mess
        (section: {
          INSTRUCTOR?: string;
          instructor: string | undefined;
          SECTION?: string;
          sectionNumber: string | undefined;
          STATUS?: string;
          status: string | undefined;
          NOW?: number;
          currentEnrollment: number | undefined;
          MAX?: number;
          maxEnrollment: number | undefined;
          IS_HONORS?: boolean;
          is_honors: boolean | undefined;
          IS_ASYNC?: boolean;
          is_async: boolean | undefined;
          CRN?: string;
          crn: string | undefined;
          COMMENTS?: string;
          comments: string | undefined;
          TIMES?: {
            day: string | undefined;
            start: string | undefined;
            end: string;
            building: string | undefined;
            room: string | undefined;
          }[];
          meetingTimes:
            | {
                day: string | undefined;
                startTime: string | undefined;
                endTime: string | undefined;
                building: string | undefined;
                room: string | undefined;
              }[]
            | undefined;
        }) => {
          if (section.IS_HONORS === undefined) {
            section.IS_HONORS = false;
          }
          if (section.IS_ASYNC === undefined) {
            section.IS_ASYNC = false;
          }
          section.instructor = section.INSTRUCTOR;
          delete section.INSTRUCTOR;
          section.sectionNumber = section.SECTION;
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
          section.meetingTimes = section.TIMES?.map((time) => {
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
        }
      );

      return course;
    })

    .catch((err) => {
      console.error(err);
      return [];
    });

  return data;
}
