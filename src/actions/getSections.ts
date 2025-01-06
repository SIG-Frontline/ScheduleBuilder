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
    .then((data) => {
      return data.courses;
    })
    .then((courses) => {
      return courses.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (course: any) => {
          if (course.CREDITS === null) {
            course.CREDITS = "TBA";
          }
          let days = "";
          if (!course.IS_ASYNC) {
            if (course.DAYS === null) {
              days = "TBA";
            } else {
              days = Object.keys(course.DAYS)
                .filter((day) => course.DAYS[day])
                .join(", ");
            }
          } else {
            days = "Async";
          }

          const returnStr = `${course.COURSE.replace(/ /g, "")}-${
            course.SECTION
          } (${course.CREDITS}) [${days}] ${course.INSTRUCTOR ?? "TBD"} `;
          const CRN = course.CRN;
          return { label: returnStr, value: CRN };
        }
      );
    })

    .catch((err) => {
      console.error(err);
      return [];
    });

  return data;
}
// {
//   "M": true,
//   "T": false,
//   "W": false,
//   "R": true,
//   "F": false,
//   "S": false,
//   "U": false
// }
