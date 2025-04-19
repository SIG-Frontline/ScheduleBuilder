import { Course, planStore } from "@/lib/client/planStore";

import { Accordion, Center, Divider, Space, Text } from "@mantine/core";
import { prettyTermText } from "@/lib/client/prettyTermText";
import PlanItem from "./Plans/PlanItem";
import NewPlanButton from "./Plans/NewPlanButton";
import CourseAccordion from "./Plans/CourseAccordion";
import Icon from "@/components/Icon/Icon";
import ImportButton from "./Plans/ImportButton";

const sumCredits = (courses: Course[] | undefined) => {
    let sum = 0;
    if (!courses) return 0;
    for (let x = 0; x < courses.length; x++) {
        sum += courses[x].credits;
    }
    return sum;
};

const Tab_Plans = () => {
    const plan_store = planStore();
    const plans = plan_store.plans;
    const terms = Array.from(new Set(plans.map((plan) => plan.term)));
    const termPlans = terms.reduce<Record<string, typeof plans>>(
        (acc, term) => {
            //Record is a utility type that creates an object type whose keys are of type K and values are of type T
            acc[term] = plans.filter((plan) => plan.term === term);
            return acc;
        },
        {}
    );

    return (
        <div className="pb-48">
            <Center my="md">
                <NewPlanButton key="newplanbutton" />
                <Space w="md" />
                <ImportButton />
            </Center>
            {terms.map((term) => (
                <span key={term}>
                    <Divider
                        my="md"
                        label={
                            <>
                                <Icon>date_range</Icon> <Space w="sm" />
                                <Text fz={"md"}>{prettyTermText(term)}</Text>
                            </>
                        }
                    />

                    <Accordion
                        chevronPosition="left"
                        maw={400}
                        mx="auto"
                        onChange={(e) => {
                            if (e === null || e === undefined) return; //make sure there is a plan selected at all times
                            plan_store.selectPlan(e);
                            console.log(plan_store.currentSelectedPlan);
                        }}
                        value={plan_store.currentSelectedPlan}
                    >
                        {termPlans[term].map((plan) => (
                            <PlanItem
                                label={`${plan.name} (${sumCredits(
                                    plan.courses
                                )})`}
                                key={plan.uuid}
                                uuid={plan.uuid}
                            >
                                <p>{plan.description}</p>
                                {plan?.courses?.map((course) => (
                                    <CourseAccordion
                                        key={course.code}
                                        course={course}
                                    />
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
