import { planStore } from "@/lib/planStore";
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
