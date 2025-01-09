import { Button, MultiSelect, Textarea, TextInput } from "@mantine/core";
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
  });

  function addEvent() {
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
        <Button variant="filled" onClick={addEvent}>
          Add Event
        </Button>{" "}
      </div>

      <br />
      <br />
      <div className="flex flex-col w-3/4 mx-auto ">
        {cur_plan?.events?.map((event) => (
          <Button
            className="my-2"
            key={event.title}
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
