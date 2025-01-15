import {
  Button,
  ColorInput,
  ColorPicker,
  Group,
  MultiSelect,
  Popover,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import React, { useState } from "react";
import { TimeInput } from "@mantine/dates";
import { planStore } from "@/lib/planStore";
const Tab_Events = () => {
  /**
   *   title: string;
  description: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];

   */
  const plan_store = planStore();
  const [event, setEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    daysOfWeek: [] as number[],
    color: "#00aa00", //default color
  });

  function addEvent() {
    if (event.title === "") {
      alert("Please enter a title");
      return;
    }
    if (event.startTime === "") {
      alert("Please enter a start time");
      return;
    }
    if (event.endTime === "") {
      alert("Please enter an end time");
      return;
    }
    if (event.daysOfWeek.length === 0) {
      alert("Please select at least one day of the week");
      return;
    }
    if (event.startTime >= event.endTime) {
      alert("Start time must be before end time");
      return;
    }
    if (event.color === "") {
      alert("Please select a color");
      return;
    }

    plan_store.addEventToPlan(event);
  }
  const cur_plan = plan_store.getPlan(plan_store.currentSelectedPlan + "");
  return (
    <>
      <div className="flex flex-col mx-6 ">
        <TextInput
          label="Event Name"
          description="Event Name"
          placeholder="Event Name"
          onChange={(e) => setEvent({ ...event, title: e.currentTarget.value })}
        />
        <TimeInput
          label="Event Start"
          description="Start Time"
          onChange={(e) =>
            setEvent({ ...event, startTime: e.currentTarget.value })
          }
        />
        <TimeInput
          label="Event End"
          description="End Time"
          onChange={(e) =>
            setEvent({ ...event, endTime: e.currentTarget.value })
          }
        />
        <Textarea
          label="Description"
          description="Event Description"
          placeholder="Event Description"
          onChange={(e) =>
            setEvent({ ...event, description: e.currentTarget.value })
          }
        />
        <MultiSelect
          label="Days of the Week"
          placeholder="Select Days"
          className="pb-4"
          data={[
            {
              label: "Sunday",
              value: "0",
            },
            {
              label: "Monday",
              value: "1",
            },
            {
              label: "Tuesday",
              value: "2",
            },
            {
              label: "Wednesday",
              value: "3",
            },
            {
              label: "Thursday",
              value: "4",
            },
            {
              label: "Friday",
              value: "5",
            },
            {
              label: "Saturday",
              value: "6",
            },
          ]}
          onChange={(days) =>
            setEvent({ ...event, daysOfWeek: days.map((day) => parseInt(day)) })
          }
        />
        <div onClick={(e) => e.stopPropagation()}>
          <Popover width={300} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Group my={"sm"}>
                <Text>Color:</Text>
                {/* <ColorSwatch component="button" color={event.color} /> */}
                <ColorInput
                  variant="unstyled"
                  size="xs"
                  radius="xl"
                  placeholder="Input placeholder"
                  value={event.color}
                  format="rgba"
                  onChange={(val) => {
                    setEvent({ ...event, color: val });
                  }}
                />
              </Group>
            </Popover.Target>
            <Popover.Dropdown>
              <div>
                <ColorPicker
                  format="rgba"
                  onChange={(val) => {
                    setEvent({ ...event, color: val });
                  }}
                  value={event.color}
                />
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
        <Button variant="filled" onClick={addEvent}>
          Add Event
        </Button>
      </div>

      <br />
      <br />
      <div className="flex flex-col w-3/4 mx-auto ">
        {cur_plan?.events?.map((event, i) => (
          <Button
            className="my-2"
            key={i}
            onClick={() => plan_store.removeEventFromPlan(event)}
          >
            Remove {event.title}
          </Button>
        ))}
      </div>
    </>
  );
};

export default Tab_Events;
