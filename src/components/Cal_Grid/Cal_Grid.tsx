"use client";
import { dayStore } from "@/lib/client/dayStore";
import InfoCard from "../InfoCard/InfoCard";
import { Plan, planStore } from "@/lib/client/planStore";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // for selectable
import { Group, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
/**
 *  Cal_Grid component is mainly responsible for rendering the timegrid view from fullcalendar.
 *  See the fullcalendar documentation for more information on how to use the fullcalendar library.
 */
const Cal_Grid = () => {

  const plan_store = planStore();
  
  const [currentSelectedPlanObj, setCurrentSelectedPlan] = useState<Plan | undefined >(
    plan_store.getPlan(plan_store.currentSelectedPlan + "") || undefined
  );
  //use effect to log the current selected plan
  
  const [cardVisible, setCardVisibility] = useState<boolean>(false);

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
          title: `${courseCode} - ${section.sectionNumber} (${item.credits}) `,
          extendedProps: {
            title: courseTitle,
            crn: section.crn,
            instructor: section.instructor,
            location: meetingTime.building + " " + meetingTime.room,
            credits: item.credits,
          },
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
          backgroundColor: item.color ?? "#00aa00",
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
      <Stack style={{ height: "100%" }}>
        
        <FullCalendar
          viewClassNames={`dark:bg-[#242424] bg-white`}
          height={"100%"}
          expandRows={true}
          plugins={[timeGridPlugin, interactionPlugin]}
          // selectable={true}
          // selectMirror={true}
          // select={() => {
          //   console.log("select");
          // }}
          slotLabelClassNames={`transform -translate-y-1/2 dark:bg-[#242424] bg-white data-[time="06:00:00"]:opacity-0`}
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
            <div className="p-1 leading-tight w-full whitespace-nowrap overflow-ellipsis overflow-x-hidden" onClick={() => setCardVisibility(!cardVisible)}>
              <b className=" w-full text-xs ">{eventContent.event.title}</b>
              <span className="text-xs">
                {eventContent.event.extendedProps.title}
              </span>
              <br />
              <span className="text-xs">{eventContent.timeText}</span> @
              <span className="text-xs">
                {eventContent.event.extendedProps.location}
              </span>
              <br />
              <span className="text-xs">
                {eventContent.event.extendedProps.instructor}
              </span>
              <br />
            </div>
          )}
          slotEventOverlap={false}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            omitZeroMinute: false,
            meridiem: "short",
          }}
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
        <InfoCard 
          cardVisible={cardVisible}
          onClose={() => setCardVisibility(false)}
        />
        <Group>
          <Group className="sticky left-0 !flex-nowrap overflow-x-auto bg-white dark:bg-[#242424]">
            {/* online courses */}
            {currentSelectedPlanObj?.courses?.map((item) => {
              const courseCode = item.code;
              const sections = item.sections;
              const courseTitle = item.title;
              const onlineSections = sections.filter(
                (section) =>
                  section.selected && section.meetingTimes.length === 0
              );

              return onlineSections.map((section) => {
                return (
                  <div
                    key={section.crn}
                    className="flex items-center space-x-2 rounded-lg border border-gray-300 p-2 my-3"
                  >

                  
                    <div
                      style={{ backgroundColor: item.color ?? "#00000" }}
                      className="w-4 h-4 rounded-full"
                    ></div>
                    <div>
                      <Text
                        className="overflow-ellipsis overflow-x-hidden whitespace-nowrap max-w-52"
                        size="md"
                      >
                        {courseCode + " " + courseTitle}
                      </Text>
                      <Group justify="space-between">
                        <Text size="sm">{section.instructor}</Text>
                        <Text size="xs" c="dimmed">
                          Online
                        </Text>
                      </Group>
                    </div>
                  </div>
                );
              });
            })}
          </Group>
        </Group>
      </Stack>
    </>
  );
};

export default Cal_Grid;
