import { Plan, planStore } from "@/lib/planStore";
import React, { useState } from "react";
import { Accordion } from "@mantine/core";
//this will be the tab that shows an accordion for each course, and each acordion will have a list of sections and a radio button to select the section

const Tab_Sections = () => {
  const [currentSelectedPlan, setCurrentSelectedPlan] = useState<Plan>();
  const getPlan = planStore((state) => state.getPlan);
  const unsubscribe = planStore.subscribe(({ currentSelectedPlan, plans }) => {
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

  return <p>{JSON.stringify(currentSelectedPlan)}</p>;
};
export default Tab_Sections;
