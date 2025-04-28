import Icon from "@/components/Icon/Icon";
import { planStore, Course } from "@/lib/client/planStore";
import {
    Accordion,
    ActionIcon,
    ColorInput,
    ColorSwatch,
    Group,
    Popover,
    Tooltip,
    Text,
} from "@mantine/core";

import Link from "next/link";
import React from "react";
import SectionSelection from "./SectionSelection";

const CourseAccordion = ({ course }: { course: Course }) => {
    const plan_store = planStore();
    const deleteCourseFromPlan = plan_store.deleteCourseFromPlan;
    const updateCourseColor = plan_store.updateCourseColor;
    const courseCode = course.code;
    return (
        <>
            <Accordion>
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
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            deleteCourseFromPlan(courseCode);
                                        }}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Space" ||
                                                e.key === "Enter"
                                            ) {
                                                deleteCourseFromPlan(
                                                    courseCode
                                                );
                                            }
                                        }}
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
                                                component={Link}
                                                href="#"
                                                onClick={(e) =>
                                                    e.preventDefault()
                                                }
                                                aria-label="change color"
                                                color={
                                                    course.color ?? "#00aa00"
                                                }
                                            />
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <div>
                                                <ColorInput
                                                    popoverProps={{
                                                        withinPortal: false,
                                                    }}
                                                    swatches={[
                                                        "#2e2e2e",
                                                        "#868e96",
                                                        "#fa5252",
                                                        "#e64980",
                                                        "#be4bdb",
                                                        "#7950f2",
                                                        "#4c6ef5",
                                                        "#228be6",
                                                        "#15aabf",
                                                        "#12b886",
                                                        "#40c057",
                                                        "#82c91e",
                                                        "#fab005",
                                                        "#fd7e14",
                                                    ]}
                                                    data-autofocus
                                                    variant="unstyled"
                                                    size="xs"
                                                    radius="xl"
                                                    placeholder="Input placeholder"
                                                    value={
                                                        course.color?.replaceAll(
                                                            /\s/g,
                                                            ""
                                                        ) ?? "#f0f"
                                                    }
                                                    format="hsla"
                                                    onChange={(val) => {
                                                        updateCourseColor(
                                                            course,
                                                            val
                                                        );
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
                                    {courseCode} ({course.credits})
                                </Text>
                            </Group>
                        </Accordion.Control>
                    </Group>
                    <Accordion.Panel>
                        <SectionSelection
                            courseCode={courseCode}
                            sections={course.sections}
                            courseTitle={course.title}
                        />
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </>
    );
};

export default CourseAccordion;
