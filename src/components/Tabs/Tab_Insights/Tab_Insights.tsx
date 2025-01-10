import { planStore } from "@/lib/planStore";
import { Card, Space, Spoiler, Text, Title } from "@mantine/core";
import React from "react";

const Tab_Insights = () => {
  const plan_store = planStore();
  const currentSelectedPlan = plan_store.currentSelectedPlan;
  const cur_plan = plan_store.getPlan(currentSelectedPlan + "");
  const cur_plan_credit_hours = cur_plan?.courses?.reduce((acc, course) => {
    return acc + course.credits;
  }, 0);

  return (
    <>
      <Card withBorder shadow="sm" mx={"md"} radius="md">
        <Title order={5}>Your Plan</Title>
        <Text>{cur_plan?.name}</Text>
        <Text>{cur_plan_credit_hours ?? ""}</Text>
      </Card>
      <Space h="xs" />
      {cur_plan?.courses?.map((course) => {
        return (
          <>
            <Card
              withBorder
              shadow="sm"
              mx={"md"}
              radius="md"
              key={course.code}
            >
              <Title order={5}>{course.code}</Title>
              <Text>{course.title}</Text>
              <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
                <Text>{course.description}</Text>
              </Spoiler>
            </Card>
            <Space h="xs" />
          </>
        );
      })}
    </>
  );
};

export default Tab_Insights;
