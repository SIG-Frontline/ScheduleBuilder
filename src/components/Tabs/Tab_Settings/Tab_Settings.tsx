import Icon from "@/components/Icon/Icon";
import { dayStore } from "@/lib/dayStore";
import {
  ActionIcon,
  Group,
  Switch,
  useMantineColorScheme,
} from "@mantine/core";
import React from "react";

const Tab_Settings = () => {
  // const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const days = [
    { label: "Su", value: 0 },
    { label: "Mo", value: 1 },
    { label: "Tu", value: 2 },
    { label: "We", value: 3 },
    { label: "Th", value: 4 },
    { label: "Fr", value: 5 },
    { label: "Sa", value: 6 },
  ];
  const day_store = dayStore();

  const { toggleColorScheme } = useMantineColorScheme();
  return (
    <>
      <Group mt="xs">
        {days.map((day) => (
          <Switch
            key={day.value}
            label={day.label}
            defaultChecked={!day_store.days.includes(day.value)}
            onChange={() => day_store.toggleDay(day.value)}
          />
        ))}
      </Group>
      <ActionIcon className="m-5" variant="light" onClick={toggleColorScheme}>
        <Icon>
          <p className="dark:hidden">light_mode</p>
          <p className="hidden dark:block">dark_mode</p>
        </Icon>
      </ActionIcon>
    </>
  );
};

export default Tab_Settings;
