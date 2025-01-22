import Icon from "@/components/Icon/Icon";
import { dayStore } from "@/lib/client/dayStore";
import {
  ActionIcon,
  Group,
  MultiSelect,
  Text,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import React from "react";

const Tab_Settings = () => {
  const days = [
    { label: "Su", value: "0" },
    { label: "Mo", value: "1" },
    { label: "Tu", value: "2" },
    { label: "We", value: "3" },
    { label: "Th", value: "4" },
    { label: "Fr", value: "5" },
    { label: "Sa", value: "6" },
  ];
  const day_store = dayStore();

  const { toggleColorScheme } = useMantineColorScheme();
  return (
    <>
      <Group m="sm">
        <Tooltip label="Toggle color scheme">
          <ActionIcon
            className="m-1"
            variant="light"
            onClick={toggleColorScheme}
          >
            <Icon>
              <p className="dark:hidden">light_mode</p>
              <p className="hidden dark:block">dark_mode</p>
            </Icon>
          </ActionIcon>
        </Tooltip>
        <Text size="md">Color Scheme</Text>
      </Group>
      <Text size="md" ta={"center"}>
        Days of the Week
      </Text>
      <MultiSelect
        mx="md"
        label="Hidden days"
        placeholder="Select hidden days"
        data={days}
        maxValues={6}
        onChange={(values) => {
          day_store.setDays(values.map((day) => parseInt(day)));
        }}
        value={day_store.days.map((day) => day.toString())}
      />
    </>
  );
};

export default Tab_Settings;
