import React, { useState } from "react";
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
} from "@mantine/core";
import { planStore, organizerSettings } from "@/lib/client/planStore";
import { organizePlan } from "@/lib/server/actions/getOrganizedPlan";

const Tab_Organizer = () => {
  const [input, setInput] = useState({
    isCommuter: false,
    commuteTime: "",
    condenseSchedules: false,
    eventPriority: false,
    error: "",
  });
  const plan_store = planStore();
  const [selectedLockedCourses, setSelectedLockedCourses] = useState<string[]>(
    []
  );

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
  async function organizeClasses() {
    // Sanitizes the temp input
    const commuteTime = isNaN(parseInt(input.commuteTime))
      ? 2
      : parseInt(input.commuteTime);
    const settings = {
      isCommuter: input.isCommuter,
      commuteTimeHours: commuteTime,
      compactPlan: input.condenseSchedules,
      courseFilters: [],
    } as organizerSettings;

    if (!selectedPlan) return;

    // HACK: inject settings into the plan

    // Saves the course filters if they are already stored (mostly for the tests, this will be changed with the new UI)
    if (
      selectedPlan.organizerSettings &&
      selectedPlan.organizerSettings.courseFilters
    )
      settings.courseFilters = selectedPlan.organizerSettings.courseFilters;
    selectedPlan.organizerSettings = settings;

    const result = await organizePlan(selectedPlan);

    if ("error" in result) {
      console.error(result);
      return;
    }

    return result;
  }

  return (
    <ScrollAreaAutosize className="px-4 py-2" type="hover">
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
              <Text size="s" c="dimmed">
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
              setInput({ ...input, isCommuter: event.currentTarget.checked });
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
              onChange={(e) =>
                setInput({ ...input, commuteTime: e.currentTarget.value })
              }
            />
          )}
        </Card>
        {/* Compact */}
        <Card withBorder={true} radius="md" className="flex flex-col gap-2">
          <Checkbox
            checked={input.condenseSchedules}
            onChange={(event) => {
              setInput({
                ...input,
                condenseSchedules: event.currentTarget.checked,
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
        <Accordion chevronPosition="left" className="border rounded-md p-4">
          <Text fw={600} size="lg">
            Advanced Mode
          </Text>
        </Accordion>
        <Button
          variant="filled"
          onClick={async () => {
            const bestPlan = await organizeClasses();

            if (!bestPlan) {
              setInput({ ...input, error: "No plan could be generated!" });
              return;
            }

            // HACK: don't save the organizer settings to the database as things are changing a lot
            delete bestPlan?.organizerSettings;

            // Update the current plan to the generated one
            // TODO: maybe ask the user if they want to create a new one to not override the current plan?
            const updatePlan = plan_store.updatePlan;
            updatePlan(bestPlan, bestPlan.uuid);
          }}
        >
          Find Best Schedule
        </Button>
        <Text ta={"center"} color="red">
          {input.error}
        </Text>
      </div>
    </ScrollAreaAutosize>
  );
};

export default Tab_Organizer;
