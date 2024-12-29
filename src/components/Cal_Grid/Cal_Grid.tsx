"use client";

import React from "react";
import { Table } from "@mantine/core";
import Cal_Event from "../Cal_Event/Cal_Event";
import { useResizeObserver } from "@mantine/hooks";
const Days_Of_Week = [
  {
    day: "Sunday",
    enabled: true,
  },
  {
    day: "Monday",
    enabled: true,
  },
  {
    day: "Tuesday",
    enabled: true,
  },
  {
    day: "Wednesday",
    enabled: true,
  },
  {
    day: "Thursday",
    enabled: true,
  },
  {
    day: "Friday",
    enabled: true,
  },
  {
    day: "Saturday",
    enabled: true,
  },
];
const timestamp_start = 5;
const timestamp_end = 21;
const timestamps = (() => {
  const timestamps = [];
  for (let i = timestamp_start; i <= timestamp_end; i++) {
    timestamps.push(
      new Date(0, 0, 0, i).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  }
  return timestamps;
})();

const Cal_Grid = () => {
  const [dayref, dayrect] = useResizeObserver();
  const [timeref, timerect] = useResizeObserver();
  const rows = timestamps.map((ts) => (
    <Table.Tr key={ts}>
      <Table.Td ref={timeref} className={"sticky left-0"} w={100}>
        {ts}
      </Table.Td>
      {Days_Of_Week.map((day) => (
        <Table.Td ref={dayref} key={day.day}></Table.Td>
      ))}
    </Table.Tr>
  ));
  return (
    <div className="relative">
      <Cal_Event
        top={350}
        left={timerect?.width + 4 * dayrect?.width}
        width={dayrect?.width}
        height={100}
      />
      <Cal_Event
        top={350}
        left={timerect?.width + 2 * dayrect?.width}
        width={dayrect?.width}
        height={100}
      />
      <Table
        horizontalSpacing={0}
        layout="fixed"
        stickyHeader
        stickyHeaderOffset={60}
        withColumnBorders
        withRowBorders={false}
        style={{
          marginBottom: "8rem",
          pointerEvents: "none",
          minWidth: "60em",
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={"sticky left-0"} w={100}>
              Time
            </Table.Th>
            {Days_Of_Week.map((day) => (
              <Table.Th ta={"center"} key={day.day}>
                {day.day}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default Cal_Grid;
