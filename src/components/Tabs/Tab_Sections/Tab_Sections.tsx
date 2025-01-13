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
  return (
    <Accordion>
      <>
        {(currentSelectedPlan === undefined ||
          currentSelectedPlan?.courses?.length === 0) && (
          <>
            <Text className="text-center !mt-8" c="dimmed" size="xl">
              <Icon className="!text-4xl">info</Icon>
            </Text>
            <Text className="text-center !mb-10 !mx-10 " c="dimmed">
              No courses have been added to this plan yet. Search for courses to
              add them.
            </Text>
          </>
        )}

        {currentSelectedPlan?.courses?.map((item) => {
          const courseCode = item.code;
          const sections = item.sections;
          const courseTitle = item.title;
          return (
            <Accordion.Item key={courseCode} value={courseCode}>
              <Group>
                <Accordion.Control>
                  <Group>
                    <Tooltip label="Remove Course">
                      <ActionIcon
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
                    <div onClick={(e) => e.stopPropagation()}>
                      <Popover
                        width={300}
                        position="bottom"
                        withArrow
                        shadow="md"
                        trapFocus
                        id="color-picker-popover"
                      >
                        <Popover.Target>
                          <ColorSwatch
                            component={Link} // this is a hack to make the color swatch clickable and accessible via tab
                            href="javascript:void(0)" //there will be a warning (when in the dev server) from react about using a link with a javascript:void(0) href, but react does not have a better way to do this to my knowledge 🥲
                            aria-label="change color"
                            color={item.color ?? "#00aa00"}
                          />
                        </Popover.Target>
                        <Popover.Dropdown>
                          <div>
                            <ColorInput
                              popoverProps={{
                                withinPortal: false,
                              }}
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
            </Accordion.Item>
          );
        })}
      </>
    </Accordion>
  );
};
export default Tab_Sections;
