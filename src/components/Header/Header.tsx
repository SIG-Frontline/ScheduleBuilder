import {
  ActionIcon,
  Avatar,
  Button,
  Flex,
  Group,
  Menu,
  MultiSelect,
  Popover,
  Space,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import React from "react";
import Icon from "../Icon/Icon";
import { useUser } from "@auth0/nextjs-auth0/client";
import { dayStore } from "@/lib/client/dayStore";

const Header = () => {
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

  const { user } = useUser();
  const isLoggedIn = Boolean(user);

  const icon = () => {
    // conditional rendering of the avatar or the settings icon
    if (isLoggedIn) {
      return <Avatar src={user?.picture} alt={user?.name ?? ""} />;
    } else {
      return (
        <ActionIcon variant="light" aria-label="Settings">
          <Icon>more_vert</Icon>
        </ActionIcon>
      );
    }
  };
  return (
    <>
      <Flex justify="space-between" align={"center"} py={10} px={20}>
        <Title
          className="overflow-hidden whitespace-nowrap my-auto text-ellipsis !text-nowrap "
          order={1}
        >
          Schedule Builder
        </Title>
        <Group>
          <ActionIcon
            // className="m-1"
            variant="light"
            onClick={toggleColorScheme}
          >
            <Icon>
              <p className="dark:hidden">light_mode</p>
              <p className="hidden dark:block">dark_mode</p>
            </Icon>
          </ActionIcon>
          <Menu
            shadow="md"
            width={200}
            closeOnItemClick={false}
            closeOnClickOutside={false}
          >
            <Menu.Target>
              <span className="flex">{icon()}</span>
            </Menu.Target>
            <Menu.Dropdown>
              <Popover withinPortal={false} width={400} withArrow shadow="md">
                <Popover.Target>
                  <Menu.Item leftSection={<Icon> settings </Icon>}>
                    Settings
                  </Menu.Item>
                </Popover.Target>
                <Popover.Dropdown>
                  <Group>
                    {/* <Group m="sm"> */}
                    {/* <Tooltip label="Toggle color scheme">
                    
                    </Tooltip>
                    <Text size="md">Color Scheme</Text> */}
                    {/* </Group> */}
                    <Space h="md" />
                    <Text size="md" ta={"center"}>
                      Days of the Week
                    </Text>
                    <MultiSelect
                      comboboxProps={{ withinPortal: false }}
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
                  </Group>
                </Popover.Dropdown>
              </Popover>
              {!isLoggedIn ? (
                <Menu.Item
                  leftSection={<Icon> login </Icon>}
                  component={"a"}
                  href={"/api/auth/login"}
                >
                  Login
                </Menu.Item>
              ) : (
                <Menu.Item
                  leftSection={<Icon> logout </Icon>}
                  href={"/api/auth/logout"}
                  component={"a"}
                >
                  Logout
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>
    </>
  );
};

export default Header;
