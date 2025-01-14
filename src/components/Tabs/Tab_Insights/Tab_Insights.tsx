import { Course, MeetingTime, Plan, planStore } from "@/lib/planStore";
import { Button, Card, Group, List, Spoiler, Text, Title } from "@mantine/core";
import Link from "next/link";
import React from "react";

const Tab_Insights = () => {
  const plan_store = planStore();
  const currentSelectedPlan = plan_store.currentSelectedPlan;
  const cur_plan = plan_store.getPlan(currentSelectedPlan + "");
  const cur_plan_credit_hours = cur_plan?.courses?.reduce((acc, course) => {
    return acc + course.credits;
  }, 0);
  const cur_plan_crn_list = cur_plan?.courses
    ?.map((course) => {
      return course.sections
        .filter((section) => section.selected)
        .map((section) => section.crn);
    })
    .filter((crn_list) => crn_list.length > 0);
  const graduate_level_credits =
    cur_plan?.courses?.reduce((sum, course) => {
      const split = course.code.split(" ")[1];
      return (
        sum +
        ((split.charAt(0) === "5" && split.toUpperCase().endsWith("G")) || //ARCH 5xxG are graduate level while ARCH 5xx are undergraduate level... thanks HCAD
        split.charAt(0) === "6" ||
        split.charAt(0) === "7"
          ? course.credits || 0
          : 0)
      );
    }, 0) || 0;
  const comments = cur_plan?.courses?.map((course) => {
    return course.sections
      .filter((section) => section.selected)
      .map((sect) => {
        return {
          course: course.code + "-" + sect.sectionNumber,
          comments: sect.comments,
        };
      });
  });
  const undergraduate_level_credits =
    cur_plan?.courses?.reduce((sum, course) => {
      const split = course.code.split(" ")[1];
      return (
        sum +
        ((split.charAt(0) === "5" && !split.toUpperCase().endsWith("G")) ||
        split.charAt(0) === "4" ||
        split.charAt(0) === "3" ||
        split.charAt(0) === "2" ||
        split.charAt(0) === "1"
          ? course.credits || 0
          : 0)
      );
    }, 0) || 0;
  const isTimeOverlapping = (time1: MeetingTime, time2: MeetingTime) => {
    const start1 = new Date(time1.startTime);
    const end1 = new Date(time1.endTime);
    const start2 = new Date(time2.startTime);
    const end2 = new Date(time2.endTime);

    return time1.day === time2.day && start1 < end2 && end1 > start2;
  };

  const getSelectedMeetingTimes = (course: Course) => {
    return course.sections
      .filter((section) => section.selected)
      .flatMap((section) => section.meetingTimes);
  };

  const findOverlappingCourses = (course: Course, otherCourses: Course[]) => {
    const meetingTimes = getSelectedMeetingTimes(course);
    const overlaps: {
      course1: {
        code: string;
        times: {
          day: string;
          startTime: string;
          endTime: string;
        };
      };
      course2: {
        code: string;
        times: {
          day: string;
          startTime: string;
          endTime: string;
        };
      };
    }[] = [];

    otherCourses.forEach((otherCourse) => {
      otherCourse.sections
        .filter((section) => section.selected)
        .forEach((section) => {
          section.meetingTimes.forEach((otherTime) => {
            meetingTimes.forEach((time) => {
              if (isTimeOverlapping(time, otherTime)) {
                overlaps.push({
                  course1: {
                    code: course.code,
                    times: {
                      day: otherTime.day,
                      startTime: otherTime.startTime,
                      endTime: otherTime.endTime,
                    },
                  },

                  course2: {
                    code: otherCourse.code,
                    times: {
                      day: otherTime.day,
                      startTime: otherTime.startTime,
                      endTime: otherTime.endTime,
                    },
                  },
                });
              }
            });
          });
        });
    });

    return overlaps;
  };

  const checkForOverlappingCourses = (plan: Plan) => {
    if (!plan?.courses?.length) {
      return {
        hasOverlaps: false,
        overlappingCourses: [],
      };
    }

    const allOverlaps: { course1: Course; course2: Course }[] = [];

    plan.courses.forEach((course) => {
      const otherCourses = plan?.courses?.filter(
        (otherCourse) => otherCourse.code !== course.code
      );

      if (otherCourses?.length) {
        const courseOverlaps = findOverlappingCourses(course, otherCourses);
        allOverlaps.push(
          ...(courseOverlaps as unknown as {
            course1: Course;
            course2: Course;
          }[])
        );
      }
    });

    // Remove duplicate overlaps (e.g., if A overlaps with B, we don't need B overlaps with A)
    const uniqueOverlaps = allOverlaps.filter((overlap, index) => {
      return (
        allOverlaps.findIndex(
          (o) =>
            (o.course1.code === overlap.course1.code &&
              o.course2.code === overlap.course2.code) ||
            (o.course1.code === overlap.course2.code &&
              o.course2.code === overlap.course1.code)
        ) === index
      );
    });

    return {
      hasOverlaps: uniqueOverlaps.length > 0,
      overlappingCourses: uniqueOverlaps,
    };
  };

  const plan_overlaping_courses = cur_plan
    ? checkForOverlappingCourses(cur_plan).hasOverlaps
    : false;
  const overlappingCourses = cur_plan
    ? checkForOverlappingCourses(cur_plan).overlappingCourses
    : [];
  return (
    <>
      <Card
        withBorder
        shadow="sm"
        mx={"md"}
        radius="md"
        mb={"xs"}
        key="current_plan"
      >
        <Title ta={"center"} order={5}>
          Your Plan
        </Title>
        <Text>Plan Name: {cur_plan?.name}</Text>
        <Text>Credits {cur_plan_credit_hours ?? ""}</Text>
        <Group>
          <Text>CRN List:</Text>
          <List unstyled lh={".5"}>
            {cur_plan_crn_list?.length && cur_plan_crn_list?.length > 0 ? (
              cur_plan_crn_list.map((crn, i) => {
                return (
                  <div key={i}>
                    <List.Item>
                      {i === 0 ? "" : ", "}
                      {crn}
                    </List.Item>
                    <br />
                  </div>
                );
              })
            ) : (
              <List.Item>Empty</List.Item>
            )}
          </List>
        </Group>
      </Card>
      {graduate_level_credits > undergraduate_level_credits &&
        cur_plan_credit_hours &&
        cur_plan_credit_hours > 12 && (
          <Card
            withBorder
            shadow="sm"
            mx={"md"}
            radius="md"
            mb={"xs"}
            key="graduate_level_overload"
            bd={"1px solid #c00"}
          >
            <Title ta={"center"} order={5}>
              Graduate Credit Overload!
            </Title>
            <Text>
              You have planned {cur_plan_credit_hours} credits, but may need to
              see an advisor to take more than 12.
            </Text>
          </Card>
        )}
      {undergraduate_level_credits > graduate_level_credits &&
        cur_plan_credit_hours &&
        cur_plan_credit_hours > 19 && (
          <Card
            withBorder
            shadow="sm"
            mx={"md"}
            radius="md"
            mb={"xs"}
            key="undergraduate_level_overload"
            bd={"1px solid #c00"}
          >
            <Title ta={"center"} order={5}>
              Undergraduate Credit Overload!
            </Title>
            <Text>
              You have planned {cur_plan_credit_hours} credits, but may need to
              see an advisor to take more than 19.
            </Text>
          </Card>
        )}
      {undergraduate_level_credits > graduate_level_credits &&
        cur_plan_credit_hours &&
        cur_plan_credit_hours < 12 && (
          <Card
            withBorder
            shadow="sm"
            mx={"md"}
            radius="md"
            mb={"xs"}
            key="undergraduate_level_overload"
            bd={"1px solid #c00"}
          >
            <Title ta={"center"} order={5}>
              Undergraduate Part Time!
            </Title>
            <Text>
              You have planned {cur_plan_credit_hours} credits, which is less
              than 12. You may want to discuss what is best for you with an
              advisor and the financial aid office.
            </Text>
          </Card>
        )}
      {graduate_level_credits > undergraduate_level_credits &&
        cur_plan_credit_hours &&
        cur_plan_credit_hours < 9 && (
          <Card
            withBorder
            shadow="sm"
            mx={"md"}
            radius="md"
            mb={"xs"}
            key="graduate_level_overload"
            bd={"1px solid #c00"}
          >
            <Title ta={"center"} order={5}>
              Graduate Part Time!
            </Title>
            <Text>
              You have planned {cur_plan_credit_hours} credits, which is less
              than 9. You may want to discuss what is best for you with an
              advisor and the financial aid office.
            </Text>
          </Card>
        )}

      {undergraduate_level_credits > 0 && graduate_level_credits > 0 && (
        <Card
          withBorder
          shadow="sm"
          mx={"md"}
          radius="md"
          mb={"xs"}
          key="graduate_level_classes"
          bd={"1px solid #c00"}
        >
          <Title ta={"center"} order={5}>
            Graduate and Undergraduate Credits
          </Title>
          <Text>
            You have {graduate_level_credits} graduate credits and{" "}
            {undergraduate_level_credits} undergraduate credits in your plan.
            Make sure you are eligible to take take both types of courses.
          </Text>
        </Card>
      )}
      {plan_overlaping_courses && (
        <Card
          withBorder
          shadow="sm"
          mx={"md"}
          radius="md"
          mb={"xs"}
          key="overlapping_courses"
          bd={"1px solid #c00"}
        >
          <Title ta={"center"} order={5}>
            Overlapping Courses
          </Title>
          <Text>
            You have overlapping courses in your plan. Please make sure you can
            attend all of them.
          </Text>
          <List unstyled>
            {overlappingCourses.map((overlap, i) => {
              const course1 = overlap.course1 as unknown as {
                code: string;
                times: { day: string; startTime: string; endTime: string };
              };
              const course2 = overlap.course2 as unknown as {
                code: string;
                times: { day: string; startTime: string; endTime: string };
              };
              return (
                <List.Item key={i}>
                  {course1.code} overlaps with {course2.code}
                </List.Item>
              );
            })}
          </List>
        </Card>
      )}
      {comments?.map((course) => {
        return course.map((section) => {
          if (section.comments === null || section.comments === "") return null;
          return (
            <Card
              withBorder
              shadow="sm"
              mx={"md"}
              radius="md"
              mb={"xs"}
              key={section.course}
            >
              <Title order={5}>{section.course} has a comment</Title>
              <Text>{section.comments.replaceAll("<br />", " ")}</Text>
            </Card>
          );
        });
      })}
      {cur_plan?.courses?.map((course) => {
        return (
          <Card
            withBorder
            shadow="sm"
            mx={"md"}
            radius="md"
            mb={"xs"}
            key={course.code}
          >
            <Title order={5}>{course.code}</Title>
            <Text>{course.title}</Text>
            <Group grow={true} gap={5} justify={"center"}>
              <Button
                href={`https://catalog.njit.edu/search/?P=${course.code.replace(
                  " ",
                  "%20"
                )}`}
                target="_blank"
                rel="noreferrer"
                component={Link}
                variant="filled"
              >
                Course Catalog
              </Button>
              <Button
                href={`https://www.google.com/search?q=NJIT+${course.code.replace(
                  " ",
                  "+"
                )}+syllabus`}
                target="_blank"
                rel="noreferrer"
                component={Link}
                variant="filled"
              >
                Google Syllabus
              </Button>
            </Group>
            <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
              <Text>{course.description}</Text>
            </Spoiler>
          </Card>
        );
      })}
    </>
  );
};

export default Tab_Insights;
