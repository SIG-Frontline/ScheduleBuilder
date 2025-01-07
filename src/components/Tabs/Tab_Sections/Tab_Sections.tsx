import { Plan, planStore } from "@/lib/planStore";
import React, { useEffect, useState } from "react";
import Section from "./SectionSelection";
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
  React.useEffect(() => {
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // return <p>{JSON.stringify(currentSelectedPlan)}</p>;
  return (
    <>
      {currentSelectedPlan?.courses?.map((item) => {
        const courseCode = item.code;
        const sections = item.sections;
        const courseTitle = item.title;
        return (
          <div key={courseCode}>
            <Section
              courseCode={courseCode}
              sections={sections}
              courseTitle={courseTitle}
            />
          </div>
        );
      })}
    </>
  );
};
export default Tab_Sections;
