"use client";
import { dayStore } from "@/lib/dayStore";
import { Plan, planStore } from "@/lib/planStore";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Group, useComputedColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
const Cal_Grid = () => {
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const plan_store = planStore();
  const [currentSelectedPlanObj, setCurrentSelectedPlan] = useState<
    Plan | undefined
  >(plan_store.getPlan(plan_store.currentSelectedPlan + "") || undefined);
  //use effect to log the current selected plan
  useEffect(() => {
    setCurrentSelectedPlan(
      plan_store.getPlan(
        plan_store.currentSelectedPlan ?? plan_store.plans[0]?.uuid
      )
    );
  }, [plan_store.currentSelectedPlan, plan_store]);
  const unsubscribe = planStore.subscribe(({ currentSelectedPlan, plans }) => {
    setCurrentSelectedPlan(
      plan_store.getPlan(currentSelectedPlan ?? plans[0]?.uuid)
    );
  });
  const day_store = dayStore();
  useEffect(() => {
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const eventData = currentSelectedPlanObj?.courses?.map((item) => {
    const courseCode = item.code;
    const sections = item.sections;
    const courseTitle = item.title;
    //filter out the sections that are not selected
    const selectedSections = sections.filter((section) => section.selected);
    const theReturnData = selectedSections.map((section) => {
      return section.meetingTimes.map((meetingTime) => {
        return {
          title: courseCode + " " + courseTitle,
          startTime:
            new Date(meetingTime.startTime)
              .toISOString()
              .split("T")[1]
              .split(".")[0] + "+00:00",
          endTime:
            new Date(meetingTime.endTime)
              .toISOString()
              .split("T")[1]
              .split(".")[0] + "+00:00",
          // daysOfWeek: meetingTime.day, // need to convert to the correct format from "M" to [1]
          daysOfWeek: [
            ["U", "M", "T", "W", "R", "F", "S"].indexOf(meetingTime.day),
          ],
          backgroundColor: "#00aa00",
        };
      });
    });
    return theReturnData;
  });
  const events_and_classes = [
    ...(eventData?.flat().flat() ?? []),
    ...(currentSelectedPlanObj?.events ?? []),
  ];

  return (
    <>
      <FullCalendar
        height={"90%"}
        plugins={[timeGridPlugin]}
        slotLabelClassNames={`transform -translate-y-1/2 ${
          computedColorScheme === "dark" ? "bg-[#242424]" : "bg-white"
        } data-[time="06:00:00"]:opacity-0`}
        timeZone="America/New_York"
        initialView="timeGridWeek"
        headerToolbar={false}
        stickyHeaderDates={true}
        dayHeaderFormat={{
          weekday: "long",
        }}
        hiddenDays={day_store.days}
        events={events_and_classes}
        allDaySlot={false}
        nowIndicator={false}
        eventContent={(eventContent) => (
          <div className="!overflow-scroll !no-scrollbar h-full">
            <b className="whitespace-nowrap">{eventContent.event.title}</b>
            <br />
            <i>{eventContent?.timeText}</i>
          </div>
        )}
        businessHours={[
          {
            daysOfWeek: [0, 1, 2, 4, 6],
            startTime: "06:00:00",
            endTime: "22:00:00",
          },
          {
            daysOfWeek: [3],
            startTime: "06:00:00",
            endTime: "14:30:00",
          },
          {
            daysOfWeek: [3],
            startTime: "18:00:00",
            endTime: "22:00:00",
          },
          {
            daysOfWeek: [5],
            startTime: "06:00:00",
            endTime: "11:30:00",
          },
          {
            daysOfWeek: [5],
            startTime: "13:00:00",
            endTime: "22:00:00",
          },
        ]}
        slotMinTime={"06:00:00"}
        slotMaxTime={"22:00:00"}
        // eventClassNames="!bg-green-500"
      />
      <Group>
        {/* online courses */}
        {currentSelectedPlanObj?.courses?.map((item) => {
          const courseCode = item.code;
          const sections = item.sections;
          const courseTitle = item.title;
          const onlineSections = sections.filter(
            (section) => section.selected && section.meetingTimes.length === 0
          );
          return onlineSections.map((section) => {
            return (
              <div key={section.crn} className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <div>{courseCode + " " + courseTitle}</div>
                  <div>Online</div>
                </div>
              </div>
            );
          });
        })}
      </Group>
    </>
  );
};

export default Cal_Grid;
