import Icon from "@/components/Icon/Icon";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import React from "react";

const Tab_Settings = () => {
  const { toggleColorScheme } = useMantineColorScheme();
  return (
    <ActionIcon className="m-5" variant="light" onClick={toggleColorScheme}>
      <Icon>
        <p className="dark:hidden">light_mode</p>
        <p className="hidden dark:block">dark_mode</p>
      </Icon>
    </ActionIcon>
  );
};

export default Tab_Settings;
