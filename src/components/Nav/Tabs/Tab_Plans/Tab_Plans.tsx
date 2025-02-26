import { planStore } from "@/lib/client/planStore";

import { Accordion, Divider } from "@mantine/core";
import { prettyTermText } from "@/lib/client/prettyTermText";
import PlanItem from "./Plans/PlanItem";
import NewPlanButton from "./Plans/NewPlanButton";
import CourseAccordion from "./Plans/CourseAccordion";
const Tab_Plans = () => {
  const plan_store = planStore();
  const plans = plan_store.plans;
  const terms = Array.from(new Set(plans.map((plan) => plan.term)));
  const termPlans = terms.reduce<Record<string, typeof plans>>((acc, term) => {
    //Record is a utility type that creates an object type whose keys are of type K and values are of type T
    acc[term] = plans.filter((plan) => plan.term === term);
    return acc;
  }, {});

  return (
    <div>
      <NewPlanButton key="newplanbutton" />
      {terms.map((term) => (
        <span key={term}>
          <Divider my="md" label={prettyTermText(term, 2)} />

          <Accordion
            chevronPosition="left"
            maw={400}
            mx="auto"
            onChange={(e) => {
              plan_store.selectPlan(e);
              console.log(plan_store.currentSelectedPlan);
            }}
            value={plan_store.currentSelectedPlan}
          >
            {termPlans[term].map((plan) => (
              <PlanItem label={plan.name} key={plan.uuid} uuid={plan.uuid}>
                <p>{plan.description}</p>
                {plan?.courses?.map((course) => (
                  <CourseAccordion key={course.code} course={course} />
                ))}
              </PlanItem>
            ))}
          </Accordion>
        </span>
      ))}
    </div>
  );
};

export default Tab_Plans;
