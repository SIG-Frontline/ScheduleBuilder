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
import React, { useEffect, useState } from "react";
import { TimeInput } from "@mantine/dates";
import { planStore } from "@/lib/client/planStore";
import type { Event } from "@/lib/client/planStore";
const Tab_Events = () => {
  /**
   *   title: string;
  description: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];

   */
  const plan_store = planStore();
  const [eventID, setEventID] = useState("");
  const currentPlan = plan_store.getPlan(plan_store.currentSelectedPlan + "");

  const [event, setEvent] = useState<Event>({ // Initialize with default values
    id: crypto.randomUUID(),
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    daysOfWeek: [],
    color: ''
  });

  useEffect(() => {
  let tempEvent: any = null;

  const handleNewEventTime = (e: CustomEvent<{ 
    startTime: string; 
    endTime: string; 
    daysOfWeek: number[];
    tempEvent: any;
  }>) => {
    tempEvent = e.detail.tempEvent;
    setEvent({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      startTime: e.detail.startTime,
      endTime: e.detail.endTime,
      daysOfWeek: e.detail.daysOfWeek,
      color: '#00aa00'
    });
  };

  // Update temporary event color when color changes
  const updateTempEventColor = (color: string) => {
    if (tempEvent) {
      tempEvent.setProp('backgroundColor', color);
    }
  };

  window.addEventListener('new-event-time', handleNewEventTime as EventListener);
  return () => {
    window.removeEventListener('new-event-time', handleNewEventTime as EventListener);
    if (tempEvent) {
      tempEvent.remove(); // Clean up temp event when component unmounts
    }
  };
}, []);


  function updateEvent() {
    if (eventID && currentPlan) {
      // Update existing event
      const updatedEvents = currentPlan.events?.map(e => 
        e.id === eventID ? event : e
      ) || [];
      
      plan_store.updatePlan(
        { ...currentPlan, events: updatedEvents },
        currentPlan.uuid
      );
    } else {
      // Add new event
      plan_store.addEventToPlan(event);
    }
    
    // Reset form
    setEvent({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      daysOfWeek: [],
      color: ''
    });
    setEventID('');
  }

  const cur_plan = plan_store.getPlan(plan_store.currentSelectedPlan + "");
  return (
    <>
      <div className="flex flex-col mx-6 ">
        <TextInput
          label="Event Name"
          description="Event Name"
          placeholder="Event Name"
          value={event.title || ''}
          onChange={(e) => setEvent({ ...event, title: e.currentTarget.value })}
        />
        <TimeInput
          label="Event Start"
          description="Start Time"
          value={event.startTime || ''}
          onChange={(e) =>
            setEvent({ ...event, startTime: e.currentTarget.value })
          }
        />
        <TimeInput
          label="Event End"
          description="End Time"
          value={event.endTime || ''}
          onChange={(e) =>
            setEvent({ ...event, endTime: e.currentTarget.value })
          }
        />
        <Textarea
          value={event.description}
          label="Description"
          description="Event Description"
          placeholder="Event Description"
          onChange={(e) =>
            setEvent({ ...event, description: e.currentTarget.value })
          }
        />
        <MultiSelect
          value={event.daysOfWeek.map(day => day.toString())} 
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
        <Button variant="filled" onClick={updateEvent}>
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
            onClick={() => plan_store.removeEventFromPlan(event.id)}
          >
            Remove {event.title}
          </Button>
        ))}
      </div>
    </>
  );
};

export default Tab_Events;
