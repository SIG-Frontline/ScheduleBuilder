import { Plan, planStore } from "@/lib/planStore";
import React, { useEffect, useState } from "react";
import Section from "./SectionSelection";
import {
  Accordion,
  ActionIcon,
  ColorInput,
  ColorSwatch,
  Group,
  Popover,
  Text,
  Tooltip,
} from "@mantine/core";
import Icon from "@/components/Icon/Icon";
import Link from "next/link";
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
  const deleteCourseFromPlan = planStore((state) => state.deleteCourseFromPlan);
  const updateCourseColor = planStore((state) => state.updateCourseColor);
  // return <p>{JSON.stringify(currentSelectedPlan)}</p>;
  return (
    <Accordion>
      <>
        {(currentSelectedPlan === undefined ||
          currentSelectedPlan?.courses?.length === 0) && (
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

        {/* <ScrollArea h={"100vh"} scrollbars="y"> */}
        {currentSelectedPlan?.courses?.map((item) => {
          const courseCode = item.code;
          const sections = item.sections;
          const courseTitle = item.title;
          return (
            <Accordion.Item key={courseCode} value={courseCode}>
              {/* <div key={courseCode} className="mx-6"> */}
              <Group>
                <Accordion.Control>
                  <Group>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Popover
                        width={300}
                        position="bottom"
                        withArrow
                        shadow="md"
                        trapFocus
                        clickOutsideEvents={["mouseup", "touchend"]}
                      >
                        <Popover.Target>
                          <ColorSwatch
                            component={Link} // this is a hack to make the color swatch clickable, and avoid react warnings
                            href="javascript:void(0)"
                            aria-label="change color"
                            color={item.color ?? "#00aa00"}
                          />
                        </Popover.Target>
                        <Popover.Dropdown>
                          <div>
                            <ColorInput
                              data-autofocus
                              variant="unstyled"
                              size="xs"
                              radius="xl"
                              placeholder="Input placeholder"
                              value={item.color ?? "#fff"}
                              format="rgba"
                              onChange={(val) => {
                                updateCourseColor(item, val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  //close the popover
                                  e.currentTarget.blur();
                                }
                              }}
                            />
                          </div>
                        </Popover.Dropdown>
                      </Popover>
                    </div>
                    <Tooltip label="Remove Course">
                      <ActionIcon
                        // pos={"absolute"}
                        className="m-1"
                        variant="outline"
                        aria-label="remove"
                        color="red"
                        component="a"
                        href="javascript:void(0)"
                        onKeyDown={(e) => {
                          if (e.key === "Space" || e.key === "Enter") {
                            deleteCourseFromPlan(courseCode);
                          }
                        }}
                        onClick={() => deleteCourseFromPlan(courseCode)}
                      >
                        <Icon>delete</Icon>
                      </ActionIcon>
                    </Tooltip>
                    <Text
                      size="md"
                      fw={600}
                      className="overflow-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {courseCode}
                    </Text>
                  </Group>
                </Accordion.Control>
              </Group>
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
        {/* </ScrollArea> */}
      </>
    </Accordion>
  );
};
export default Tab_Sections;
