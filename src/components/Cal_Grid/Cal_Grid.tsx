"use client";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
const Cal_Grid = () => {
  return (
    <FullCalendar
      plugins={[timeGridPlugin]}
      slotLabelClassNames={"transform -translate-y-1/2 bg-white"}
      timeZone="America/New_York"
      initialView="timeGridWeek"
      headerToolbar={{
        left: "",
        center: "",
        right: "",
      }}
      stickyHeaderDates={true}
      dayHeaderFormat={{
        weekday: "long",
      }}
      events={[
        {
          title: "Repeating Event",
          startTime: "08:00:00+00:00",
          daysOfWeek: [1, 2, 4],
          endTime: "12:00:00+00:00",
        },
      ]}
      allDaySlot={false}
      nowIndicator={false}
      eventContent={(eventContent) => (
        <div>
          <i>{eventContent.event.title}</i>
          <br />
          <b>{eventContent?.timeText}</b>
        </div>
      )}
      businessHours={[
        {
          daysOfWeek: [0, 1, 3, 4, 6],
          startTime: "06:00:00",
          endTime: "22:00:00",
        },
        {
          daysOfWeek: [2],
          startTime: "06:00:00",
          endTime: "14:30:00",
        },
        {
          daysOfWeek: [2],
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
  );
};

export default Cal_Grid;
