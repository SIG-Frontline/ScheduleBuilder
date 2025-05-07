import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Text,
  TextInput,
  Checkbox,
  Group,
  Card,
  MultiSelect,
  Accordion,
  ScrollAreaAutosize,
  Title,
  Select,
  Divider,
} from "@mantine/core";
import {
  planStore,
  organizerSettings,
  instructionType,
} from "@/lib/client/planStore";
import { organizePlan } from "@/lib/server/actions/getOrganizedPlan";
import { notifications } from "@mantine/notifications";

type organizerCourseSettings = {
  lockedCourses: string[];
  instructors: Record<string, string>;
  instructionMethods: Record<string, string>;
};

const Tab_Organizer = () => {
  // non course specific plan settings input
  const [input, setInput] = useState({
    daysOnCampus: "",
    compactPlan: false,
    eventPriority: false,
    error: "",
  });
  // course specific settings aka coruseFilters
  const [courseSettings, setCourseSettings] = useState<organizerCourseSettings>(
    {
      lockedCourses: [],
      instructors: {},
      instructionMethods: {},
    }
  );
  const [accordionOpened, setAccordionOpened] = useState<string | null>(null);
  const [disableSubmitButton, setDisableSubmitButton] = useState(false);
  const hasShownMissingPlanNotification = useRef(false);
  const lastSavedSettingsRef = useRef<organizerSettings | null>(null);
  const hasShownNotification = useRef(false);
  const plan_store = planStore();
  const selectedPlanuuid = plan_store.currentSelectedPlan;
  const selectedPlan = plan_store.plans.find(
    (plan) => plan.uuid === selectedPlanuuid
  );
  const selectedCourses = selectedPlan
    ? plan_store
        .findSelectedSections(selectedPlan)
        .map(({ courseCode, section }) => {
          return `${courseCode}-${section.sectionNumber}`;
        })
    : [];

  const formatInstructionalMethod = (instructionMethod: string | null) => {
    if (!instructionMethod) return "unknown";

    const cleaned = instructionMethod.trim().toLowerCase();

    if (["face-to-face"].includes(cleaned)) return "in person"; // in person
    if (["hyflex", "hybrid"].includes(cleaned)) return "hybrid"; // two hybrid options

    // default all other to online
    return "online";
  };

  // objects that maps course code to instructors and instructional methods
  // excludes any locked courses
  const instructorsPerCourse = selectedPlan?.courses
    ? selectedPlan.courses
        .filter((course) => {
          return !courseSettings.lockedCourses.some((locked) =>
            locked.startsWith(course.code)
          );
        })
        .reduce(
          (acc, course) => {
            const instructorsSet = new Set<string>();
            const instructorToMethodsMap: Record<string, Set<string>> = {};
            const allMethodsSet = new Set<string>();
            let hasRealInstructor = false;

            for (const section of course.sections) {
              const Instructor = section.instructor?.trim();
              const instructionMethod = formatInstructionalMethod(
                section.instructionType
              );

              if (Instructor && Instructor !== "") {
                instructorsSet.add(Instructor);
                hasRealInstructor = true;
                if (!instructorToMethodsMap[Instructor]) {
                  instructorToMethodsMap[Instructor] = new Set();
                }

                if (instructionMethod) {
                  instructorToMethodsMap[Instructor].add(instructionMethod);
                  allMethodsSet.add(instructionMethod);
                }
              } else if (instructionMethod) {
                // include method even if instructor is missing
                allMethodsSet.add(instructionMethod);
              }
            }

            if (!hasRealInstructor) {
              instructorsSet.add("Instructor Not Listed");
            }

            acc[course.code] = {
              instructors: Array.from(instructorsSet),
              instructorToMethods: Object.fromEntries(
                Object.entries(instructorToMethodsMap).map(
                  ([instructor, methodsSet]) => [
                    instructor,
                    Array.from(methodsSet),
                  ]
                )
              ),
              allMethods: Array.from(allMethodsSet),
            };

            return acc;
          },
          {} as Record<
            string,
            {
              instructors: string[];
              instructorToMethods: Record<string, string[]>;
              allMethods: string[];
            }
          >
        )
    : {};

  const handleInstructionMethodSelect = (
    method: string,
    courseCode: string
  ) => {
    setCourseSettings((prev) => ({
      ...prev,
      instructionMethods: {
        ...prev.instructionMethods,
        [courseCode]:
          prev.instructionMethods[courseCode] === method ? "" : method,
      },
    }));
  };

  const methodToEnum: Record<string, instructionType> = {
    online: instructionType.ONLINE,
    "in person": instructionType.INPERSON,
    hybrid: instructionType.HYBRID,
  };

  // useEffect hook to pull any saved organizer settings from a plan
  // notifies users of any saved organizer settings
  useEffect(() => {
    const settings = selectedPlan?.organizerSettings;

    const shouldNotify =
      settings &&
      !hasShownNotification.current &&
      (settings.daysOnCampus ||
        settings.compactPlan ||
        settings.eventPriority ||
        settings.courseFilters?.length);

    if (shouldNotify) {
      notifications.show({
        title: "Organizer Settings",
        message: `You're previously used organizer settings have been autofilled`,
        color: "blue",
        autoClose: 3000,
        position: "top-right",
      });
      hasShownNotification.current = true;
    }

    if (settings) {
      const restoredLockedCourses: string[] = [];
      const restoredInstructors: Record<string, string> = {};
      const restoredMethods: Record<string, string> = {};

      for (const filter of settings.courseFilters ?? []) {
        if ("section" in filter && filter.courseCode && filter.section) {
          const isValid = selectedPlan?.courses?.some(
            (course) =>
              course.code === filter.courseCode &&
              course.sections.some(
                (section) => section.sectionNumber === filter.section
              )
          );
          if (isValid) {
            restoredLockedCourses.push(
              `${filter.courseCode}-${filter.section}`
            );
          }
        }

        if (
          "instructor" in filter &&
          filter.courseCode &&
          typeof filter.instructor === "string"
        ) {
          restoredInstructors[filter.courseCode] = filter.instructor;
          setAccordionOpened("advanced-mode");
        }

        if (
          "online" in filter &&
          filter.courseCode &&
          typeof filter.online === "string"
        ) {
          const method = filter.online as instructionType;
          if (Object.values(instructionType).includes(method)) {
            restoredMethods[filter.courseCode] = method;
            setAccordionOpened("advanced-mode");
          }
        }
      }

      setInput((prev) => ({
        ...prev,
        daysOnCampus:
          settings.daysOnCampus !== undefined
            ? settings.daysOnCampus.toString()
            : "",
        compactPlan: settings.compactPlan,
        eventPriority: settings.eventPriority ?? false,
      }));

      setCourseSettings((prev) => ({
        ...prev,
        lockedCourses: restoredLockedCourses,
        selectedInstructrs: restoredInstructors,
        instructionMethods: restoredMethods,
      }));
    }
  }, [selectedPlanuuid]);

  // useEffect hook responsible for automatically saving any changes the user makes to their organizer settings
  // merges all of the organizerCourseSettings into one courseFilter array to send to the backend
  useEffect(() => {
    if (!selectedPlan || !selectedPlanuuid) {
      setDisableSubmitButton(true);
      if (!hasShownMissingPlanNotification.current) {
        notifications.show({
          title: "No Plan Selected",
          message: "You must select a plan to use the organizer.",
          color: "red",
          autoClose: 5000,
          position: "top-right",
        });
        hasShownMissingPlanNotification.current = true;
      }
      return;
    }

    const courseFilters = [
      ...courseSettings.lockedCourses.map((locked) => {
        const [courseCode, section] = locked.split("-");
        return { courseCode, section };
      }),
      ...Object.entries(courseSettings.instructors)
        .filter(
          ([_, instructor]) =>
            instructor !== "" &&
            instructor !== "No Preference" &&
            instructor !== "Instructor Not Listed"
        )
        .map(([courseCode, instructor]) => ({
          courseCode,
          instructor,
        })),
      ...Object.entries(courseSettings.instructionMethods)
        .filter(([_, method]) => method && method !== "")
        .map(([courseCode, method]) => ({
          courseCode,
          online: methodToEnum[method.toLowerCase()],
        })),
    ];

    const updatedSettings: organizerSettings = {
      daysOnCampus: input.daysOnCampus
        ? isNaN(parseInt(input.daysOnCampus))
          ? 2
          : parseInt(input.daysOnCampus)
        : undefined,
      compactPlan: input.compactPlan,
      eventPriority: input.eventPriority,
      courseFilters,
    };

    const lastSaved = JSON.stringify(lastSavedSettingsRef.current);
    const current = JSON.stringify(updatedSettings);

    if (lastSaved !== current) {
      lastSavedSettingsRef.current = updatedSettings;
      plan_store.updatePlanSettings(updatedSettings, selectedPlanuuid);
    }
  }, [
    input.daysOnCampus,
    input.compactPlan,
    input.eventPriority,
    courseSettings.lockedCourses,
    courseSettings.instructors,
    courseSettings.instructionMethods,
    selectedPlanuuid,
    selectedPlan,
  ]);

  // since organizer settings are saved in the useEffect above
  // in this function we just need to send the selected plan to the backend through the organizePlan server action
  async function organizeClasses() {
    if (!selectedPlan || !selectedPlanuuid) return;

    const organizedPlan = await organizePlan(selectedPlan);

    if ("error" in organizedPlan) {
      notifications.show({
        title: "Unable to Organize",
        message:
          "We were unable to generate a schedule based on your current selections. Please adjust your preferences and try again.",
        color: "red",
        autoClose: 5000,
        position: "top-right",
      });
      return;
    }

    return organizedPlan;
  }

  return (
    <ScrollAreaAutosize className="px-4 pt-2 pb-24" type="hover">
      <div className="mb-2">
        <Text c="dimmed">
          Customize your schedule according to your preferences.
        </Text>
      </div>
      <div className="flex flex-col gap-3">
        {/* Lock Courses */}
        <Card withBorder={true} radius="md">
          <Group wrap="nowrap" align="flex-start">
            <div className="flex flex-col gap-2">
              <Text fw={600} size="lg">
                Lock Courses{" "}
                <Text component="span" c="red" inherit>
                  *
                </Text>
              </Text>
              <Text size="xs" c="dimmed">
                Selected sections will not be changed during customization.
              </Text>
              <MultiSelect
                placeholder={
                  courseSettings.lockedCourses.length === 0
                    ? "Select some sections to keep"
                    : ""
                }
                data={selectedCourses}
                value={courseSettings.lockedCourses}
                onChange={(newLocked) =>
                  setCourseSettings((prev) => ({
                    ...prev,
                    lockedCourses: newLocked,
                  }))
                }
                searchable
                nothingFoundMessage="Nothing found..."
                checkIconPosition="right"
              />
            </div>
          </Group>
        </Card>
        {/* Days On Campus */}
        <Card withBorder={true} radius="md" className="flex flex-col gap-2">
          <Text fw={600} size="lg">
            Number of In-Person Days{" "}
            <Text component="span" c="red" inherit>
              *
            </Text>
          </Text>
          <TextInput
            description="Enter the numbers of days you want to spend on campus"
            placeholder="5"
            value={input.daysOnCampus}
            onChange={(event) => {
              setInput({
                ...input,
                daysOnCampus: event.currentTarget.value,
              });
            }}
          />
        </Card>
        {/* Compact */}
        <Card withBorder={true} radius="md" className="flex flex-col gap-2">
          <Checkbox
            checked={input.compactPlan}
            onChange={(event) => {
              setInput({
                ...input,
                compactPlan: event.currentTarget.checked,
              });
            }}
            size="md"
            label={
              <Text fw={600} size="lg">
                Compact{" "}
                <Text component="span" c="red" inherit>
                  *
                </Text>
              </Text>
            }
          />
          <Text size="xs" c="dimmed">
            When applicable, prioritize schedules that contain a less amount of
            time between classes.
          </Text>
          <Text size="xs" c="red">
            WARNING: It is not recommended to have too many classes
            back-to-back. Take a break!
          </Text>
        </Card>
        {/* Event Priority */}
        <Card withBorder={true} radius="md" className="flex flex-col gap-2">
          <Checkbox
            checked={input.eventPriority}
            onChange={(event) => {
              setInput({
                ...input,
                eventPriority: event.currentTarget.checked,
              });
            }}
            size="md"
            label={
              <Text fw={600} size="lg">
                Event Priority{" "}
                <Text component="span" c="red" inherit>
                  *
                </Text>
              </Text>
            }
          />
          <Text size="xs" c="dimmed">
            When applicable, prioritize schedules that do not overlap with user
            events.
          </Text>
        </Card>
        <Accordion
          chevronPosition="left"
          className="border rounded-md"
          value={accordionOpened}
          onChange={setAccordionOpened}
        >
          <Accordion.Item value="advanced-mode">
            <Accordion.Control>
              <Text fw={600} size="lg">
                Advanced Mode
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="xs" c="dimmed">
                Advanced mode allows you to select specific instructors, or
                instruction methods for each course.
              </Text>
            </Accordion.Panel>
            <Accordion.Panel>
              <Text size="xs" c="red">
                Note: Courses locked in the option above will not appear in this
                menu, unselect them first if you would like to customize them
                here.
              </Text>
            </Accordion.Panel>
            {Object.entries(instructorsPerCourse).map(
              ([courseCode, { instructors }]) => {
                return (
                  <React.Fragment key={courseCode}>
                    <Accordion.Panel className="mt-2">
                      <Title order={5}>{courseCode}</Title>
                      <Select
                        label={
                          <Text size="xs" c="dimmed" mb={8}>
                            Select one of the following course instructors
                          </Text>
                        }
                        checkIconPosition="right"
                        placeholder="Pick value"
                        nothingFoundMessage="Nothing found..."
                        data={[
                          ...instructors,
                          ...(instructors.includes("Instructor Not Listed") ||
                          instructors.length === 0
                            ? []
                            : ["No Preference"]),
                        ]}
                        value={courseSettings.instructors[courseCode] || null}
                        onChange={(value) => {
                          setCourseSettings((prev) => ({
                            ...prev,
                            instructors: {
                              ...prev.instructors,
                              [courseCode]: value || "",
                            },
                          }));
                        }}
                      />
                    </Accordion.Panel>
                    <Accordion.Panel>
                      <Text size="xs" c="dimmed" mb={8}>
                        Select one of the following instruction methods
                      </Text>
                      <Group mt="sm">
                        {[
                          {
                            label: "In Person",
                            value: "in person",
                          },
                          { label: "Online", value: "online" },
                          { label: "Hybrid", value: "hybrid" },
                        ].map(({ label, value }) => {
                          const selectedInstructor =
                            courseSettings.instructors[courseCode]?.trim();

                          const { instructorToMethods, allMethods } =
                            instructorsPerCourse[courseCode] || {
                              instructorToMethods: {},
                              allMethods: [],
                            };

                          const allowedMethods = selectedInstructor
                            ? instructorToMethods[selectedInstructor]?.map(
                                (m) => m.toLowerCase()
                              )
                            : allMethods.map((m) => m.toLowerCase());

                          const isDisabled = !allowedMethods?.includes(
                            value.toLowerCase()
                          );

                          return (
                            <Checkbox
                              key={value}
                              label={label}
                              checked={
                                courseSettings.instructionMethods[
                                  courseCode
                                ] === value
                              }
                              onChange={() =>
                                handleInstructionMethodSelect(value, courseCode)
                              }
                              disabled={isDisabled}
                            />
                          );
                        })}
                      </Group>
                    </Accordion.Panel>
                    <Divider
                      className={
                        accordionOpened === "advanced-mode" ? "block" : "hidden"
                      }
                    />
                  </React.Fragment>
                );
              }
            )}
          </Accordion.Item>
        </Accordion>
        <Button
          variant="filled"
          disabled={disableSubmitButton}
          onClick={async () => {
            const bestPlan = await organizeClasses();
            if (!bestPlan) {
              setInput((prev) => ({
                ...prev,
                error: "No plan could be generated!",
              }));
              return;
            }
            plan_store.updatePlan(bestPlan, bestPlan.uuid);
          }}
        >
          Find Best Schedule
        </Button>
      </div>
    </ScrollAreaAutosize>
  );
};

export default Tab_Organizer;
