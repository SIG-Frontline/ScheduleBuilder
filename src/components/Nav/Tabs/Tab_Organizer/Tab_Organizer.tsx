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
  Modal,
} from "@mantine/core";
import {
  planStore,
  organizerSettings,
  instructionType,
} from "@/lib/client/planStore";
import { organizePlan } from "@/lib/server/actions/getOrganizedPlan";
import { notifications } from "@mantine/notifications";

const Tab_Organizer = () => {
  const [input, setInput] = useState({
    isCommuter: false,
    commuteDays: "",
    compactPlan: false,
    eventPriority: false,
    error: "",
  });
  const [selectedLockedCourses, setSelectedLockedCourses] = useState<string[]>(
    []
  );
  const [selectedInstructors, setSelectedInstructors] = useState<
    Record<string, string>
  >({});
  const [selectedInstructionMethods, setSelectedInstructionMethods] = useState<
    Record<string, string>
  >({});
  const originalSettingsRef = useRef<organizerSettings | null>(null);
  const [accordionOpened, setAccordionOpened] = useState<string | null>(null);
  const hasShownNotification = useRef(false);
  const plan_store = planStore();
  // Creates the new plan based on the term of the currently selected plan
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

  const instructorsPerCourse = selectedPlan?.courses
    ? selectedPlan.courses
        .filter((course) => {
          return !selectedLockedCourses.some((locked) =>
            locked.startsWith(course.code)
          );
        })
        .map((course) => {
          const instructors = new Set<string>();

          course.sections.forEach((section) => {
            const name = section.instructor?.trim();
            if (name) {
              instructors.add(name);
            }
          });

          return {
            courseCode: course.code,
            instructors: Array.from(instructors),
          };
        })
    : [];

  const handleInstructionMethodSelect = (
    method: string,
    courseCode: string
  ) => {
    setSelectedInstructionMethods((prev) => ({
      ...prev,
      [courseCode]: prev[courseCode] === method ? "" : method,
    }));
  };

  const methodToEnum: Record<string, instructionType> = {
    "in person": instructionType.INPERSON,
    Hybrid: instructionType.HYBRID,
    online: instructionType.ONLINE,
  };

  useEffect(() => {
    const settings = selectedPlan?.organizerSettings;

    const shouldNotify =
      settings &&
      !hasShownNotification.current &&
      (settings.isCommuter ||
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
      originalSettingsRef.current = {
        isCommuter: settings.isCommuter,
        commuteDays: settings.commuteDays,
        compactPlan: settings.compactPlan,
        eventPriority: settings.eventPriority,
        courseFilters: settings.courseFilters || [],
      };

      const lockedCourses: string[] = [];
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
            lockedCourses.push(`${filter.courseCode}-${filter.section}`);
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
        isCommuter: settings.isCommuter,
        commuteDays:
          settings.commuteDays !== undefined
            ? settings.commuteDays.toString()
            : "",
        compactPlan: settings.compactPlan,
        eventPriority: settings.eventPriority ?? false,
      }));

      setSelectedLockedCourses(lockedCourses);
      setSelectedInstructors(restoredInstructors);
      setSelectedInstructionMethods(restoredMethods);
    }
  }, [selectedPlanuuid]);

  async function organizeClasses(
    lockedCourses: string[],
    instructors: Record<string, string>,
    instructionMethod: Record<string, string>,
    inputState: typeof input
  ) {
    const courseFilters = [
      ...lockedCourses.map((locked) => {
        const [courseCode, section] = locked.split("-");
        return { courseCode, section };
      }),
      ...Object.entries(instructors)
        .filter(([_, instructor]) => instructor !== "")
        .map(([courseCode, instructor]) => ({
          courseCode,
          instructor,
        })),
      ...Object.entries(instructionMethod)
        .filter(([_, method]) => method !== "")
        .map(([courseCode, method]) => ({
          courseCode,
          online: method === "in person" ? "face-to-face" : method,
        })),
    ];
    const settings = {
      isCommuter: inputState.isCommuter,
      commuteDays: inputState.isCommuter
        ? isNaN(parseInt(inputState.commuteDays))
          ? 2
          : parseInt(inputState.commuteDays)
        : undefined,
      compactPlan: inputState.compactPlan,
      eventPriority: inputState.eventPriority,
      courseFilters,
    } as organizerSettings;

    if (!selectedPlan || !selectedPlanuuid) return;
    plan_store.updatePlanSettings(settings, selectedPlanuuid);

    const newPlan = {
      ...structuredClone(selectedPlan),
      organizerSettings: settings,
    };

    const organizedPlan = await organizePlan(newPlan);

    if ("error" in organizedPlan) {
      console.error(organizedPlan);
      return;
    }

    const finalPlan = {
      ...organizedPlan,
      organizerSettings: settings,
    };

    plan_store.updatePlan(finalPlan, finalPlan.uuid);

    return finalPlan;
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
                  selectedLockedCourses.length === 0
                    ? "Select some sections to keep"
                    : ""
                }
                data={selectedCourses}
                value={selectedLockedCourses}
                onChange={setSelectedLockedCourses}
                searchable
                nothingFoundMessage="Nothing found..."
                checkIconPosition="right"
              />
            </div>
          </Group>
        </Card>
        {/* Commuter */}
        <Card withBorder={true} radius="md" className="flex flex-col gap-2">
          <Checkbox
            checked={input.isCommuter}
            onChange={(event) => {
              const isChecked = event.currentTarget.checked;
              setInput({
                ...input,
                isCommuter: isChecked,
                commuteDays: isChecked ? input.commuteDays : "",
              });
            }}
            size="md"
            label={
              <Text fw={600} size="lg">
                Commuter{" "}
                <Text component="span" c="red" inherit>
                  *
                </Text>
              </Text>
            }
          />
          <Text size="xs" c="dimmed">
            When applicable, prioritize schedules with less number of days spent
            on campus.
          </Text>
          {input.isCommuter && (
            <TextInput
              description="The numbers of days you want to spend on campus"
              placeholder="2"
              value={input.commuteDays}
              onChange={(event) => {
                setInput({
                  ...input,
                  commuteDays: event.currentTarget.value,
                });
              }}
            />
          )}
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
            {instructorsPerCourse.map(({ courseCode, instructors }) => (
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
                    data={instructors}
                    value={selectedInstructors[courseCode] || null}
                    onChange={(value) => {
                      setSelectedInstructors((prev) => ({
                        ...prev,
                        [courseCode]: value || "",
                      }));
                    }}
                  />
                </Accordion.Panel>
                <Accordion.Panel>
                  <Text size="xs" c="dimmed" mb={8}>
                    Select one of the following instruction methods
                  </Text>
                  <Group mt="sm">
                    <Checkbox
                      label="In Person"
                      checked={
                        selectedInstructionMethods[courseCode] ===
                        "face-to-face"
                      }
                      onChange={() =>
                        handleInstructionMethodSelect(
                          instructionType.INPERSON,
                          courseCode
                        )
                      }
                    />
                    <Checkbox
                      label="Online"
                      checked={
                        selectedInstructionMethods[courseCode] === "online"
                      }
                      onChange={() =>
                        handleInstructionMethodSelect(
                          instructionType.ONLINE,
                          courseCode
                        )
                      }
                    />
                    <Checkbox
                      label="Hybrid"
                      checked={
                        selectedInstructionMethods[courseCode] === "Hybrid"
                      }
                      onChange={() =>
                        handleInstructionMethodSelect(
                          instructionType.HYBRID,
                          courseCode
                        )
                      }
                    />
                  </Group>
                </Accordion.Panel>
                <Divider
                  className={
                    accordionOpened === "advanced-mode" ? "block" : "hidden"
                  }
                />
              </React.Fragment>
            ))}
          </Accordion.Item>
        </Accordion>
        <Button
          variant="filled"
          onClick={async () => {
            const bestPlan = await organizeClasses(
              selectedLockedCourses,
              selectedInstructors,
              selectedInstructionMethods,
              input
            );
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
        <Text ta={"center"} c="red">
          {input.error}
        </Text>
      </div>
    </ScrollAreaAutosize>
  );
};

export default Tab_Organizer;
