import { planStore, Section } from "@/lib/client/planStore";
import {
  Badge,
  Group,
  Text,
  Radio,
  Stack,
  Title,
  ScrollAreaAutosize,
} from "@mantine/core";
// import { useMediaQuery } from "@mantine/hooks";
import React, { useState } from "react";

const SectionSelection = ({
  courseCode,
  sections,
  courseTitle,
}: {
  courseCode: string;
  sections: Section[];
  courseTitle: string;
}) => {
  // const matches = useMediaQuery(
  //   "only screen and (orientation: landscape) and (min-width: 1201px)"
  // );
  const selectSection = planStore((state) => state.selectSection);

  const [value, setValue] = useState<string | null>(
    sections.find((item) => item.selected)?.crn || null
  );
  const options = sections.map((item) => (
    <Radio.Card radius="md" p={"sm"} value={item.crn} key={item.crn} hidden={item.status.toLowerCase()=="cancelled" && item.crn != value}>
      <Group gap="sm" align="start">
        <Radio.Indicator />
        <Group gap="1" align="start" ms={"auto"}>
          {item.meetingTimes.map((time) => (
            <Badge variant="light" key={time.day + time.startTime}>
              {time.day}
            </Badge>
          ))}
        </Group>
      </Group>
      <Stack gap={0} align="flex-start">
        <Text size="md" fw={600}>
          {courseCode}-{item.sectionNumber}
        </Text>
        <Text size="sm" c="dimmed">
          {item.instructor}
        </Text>
      </Stack>
      <Group>
        {[
          ...new Set(
            item.meetingTimes.map((time) => `${time.building} ${time.room}`)
          ),
        ].map((location) => (
          <Badge variant="light" mt={"5"} key={location}>
            <Text size="xs" key={location} c="blue">
              {location}
            </Text>
          </Badge>
        ))}
      </Group>
    </Radio.Card>
  ));
  return (
    <>
      <Group justify="start" align="start" mt={"sm"}>
        <div className="flex-grow">
          <Group mb={"sm"} pos={"relative"}>
            <Title
              order={3}
              size="md"
              fw={500}
              ta={"center"}
              mx={"auto"}
              className="overflow-ellipsis overflow-hidden whitespace-nowrap"
            >
              {courseTitle}
            </Title>
          </Group>

          <Radio.Group
            value={value}
            onChange={(val) => {
              setValue(val);
              selectSection(courseCode, val);
            }}
          >
            <ScrollAreaAutosize mah="20em" scrollbars="y">
              <Stack pt="md" gap="xs">
                {options}
              </Stack>
            </ScrollAreaAutosize>
          </Radio.Group>
        </div>
      </Group>
    </>
  );
};

export default SectionSelection;
