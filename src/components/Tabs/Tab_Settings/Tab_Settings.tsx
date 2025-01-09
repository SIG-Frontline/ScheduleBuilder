import Icon from "@/components/Icon/Icon";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import React from "react";

const Tab_Settings = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <ActionIcon className="m-5" variant="light" onClick={toggleColorScheme}>
      <Icon>{colorScheme === "dark" ? "light_mode" : "dark_mode"}</Icon>
    </ActionIcon>
  );
};

export default Tab_Settings;
