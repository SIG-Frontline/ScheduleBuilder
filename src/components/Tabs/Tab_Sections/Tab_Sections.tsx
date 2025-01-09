import { Plan, planStore } from "@/lib/planStore";
import React, { useEffect, useState } from "react";
import Section from "./SectionSelection";
import { Accordion, ScrollArea, Text } from "@mantine/core";
import Icon from "@/components/Icon/Icon";
// import { Accordion } from "@mantine/core";
//this will be the tab that shows an accordion for each course, and each acordion will have a list of sections and a radio button to select the section

const Tab_Sections = () => {
  //get the current selected plan from the store
  const getPlan = planStore((state) => state.getPlan);
  const cur_plan_id = planStore((state) => state.currentSelectedPlan) as string;
  const curpln = getPlan(cur_plan_id);
  const [currentSelectedPlan, setCurrentSelectedPlan] = useState<
    Plan | undefined
  >(curpln);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const unsubscribe = planStore.subscribe(({ currentSelectedPlan, plans }) => {
    //if the component has not mounted, return
    if (!hasMounted) {
      return;
    }
    //if there is no selected plan, and there are plans, select the first plan
    if (!currentSelectedPlan && plans.length > 0) {
      setCurrentSelectedPlan(plans[0]);
    }
    //if the current selected plan is not null, set the current selected plan
    if (currentSelectedPlan) {
      setCurrentSelectedPlan(getPlan(currentSelectedPlan));
    }
  });

  //on unmount, unsubscribe from the store
  useEffect(() => {
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // return <p>{JSON.stringify(currentSelectedPlan)}</p>;
  return (
    <Accordion>
      <>
        {currentSelectedPlan?.courses?.length === 0 && (
          <>
            <Text className="text-center !mt-8" c="dimmed" size="xl">
              <Icon className="!text-4xl">info</Icon>
            </Text>
            <Text className="text-center !mx-10 " c="dimmed">
              No courses have been added to this plan yet. Search for courses to
              add them.
            </Text>
          </>
        )}
        <ScrollArea h={"100vh"} scrollbars="y">
          {currentSelectedPlan?.courses?.map((item) => {
            const courseCode = item.code;
            const sections = item.sections;
            const courseTitle = item.title;
            return (
              <Accordion.Item key={courseCode} value={courseCode}>
                {/* <div key={courseCode} className="mx-6"> */}
                <Accordion.Control>{courseCode}</Accordion.Control>
                <Accordion.Panel>
                  <Section
                    courseCode={courseCode}
                    sections={sections}
                    courseTitle={courseTitle}
                  />
                </Accordion.Panel>
                {/* </div> */}
              </Accordion.Item>
            );
          })}
        </ScrollArea>
      </>{" "}
    </Accordion>
  );
};
export default Tab_Sections;
