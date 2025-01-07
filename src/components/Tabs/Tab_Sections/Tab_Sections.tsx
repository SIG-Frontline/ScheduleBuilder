import { Plan, planStore } from "@/lib/planStore";
import React, { useEffect, useState } from "react";
import { Accordion } from "@mantine/core";
//this will be the tab that shows an accordion for each course, and each acordion will have a list of sections and a radio button to select the section

const Tab_Sections = () => {
  const [currentSelectedPlan, setCurrentSelectedPlan] = useState<Plan>();
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const getPlan = planStore((state) => state.getPlan);
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

    console.log("state", currentSelectedPlan);
  });

  //on unmount, unsubscribe from the store
  React.useEffect(() => {
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // return <p>{JSON.stringify(currentSelectedPlan)}</p>;
  const items = currentSelectedPlan?.courses?.map((item) => {
    const courseCode = item.code;
    const sections = item.sections;
    const courseTitle = item.title;
    return (
      <Accordion.Item key={courseCode} value={courseTitle}>
        <Accordion.Control icon={courseCode}>{courseTitle}</Accordion.Control>
        <Accordion.Panel>
          <h1>{courseCode}</h1>
          <ul>
            {sections.map((section) => (
              <li key={section.crn}>{section.crn}</li>
            ))}
          </ul>
        </Accordion.Panel>
      </Accordion.Item>
    );
  });

  return <Accordion defaultValue="Apples">{items}</Accordion>;
};
export default Tab_Sections;
