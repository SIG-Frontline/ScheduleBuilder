import {
  ActionIcon,
  Avatar,
  Button,
  Flex,
  Group,
  Menu,
  Modal,
  MultiSelect,
  Popover,
  Space,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import React, {useState} from "react";
import Icon from "../Icon/Icon";
import { useUser } from "@auth0/nextjs-auth0";
import { dayStore } from "@/lib/client/dayStore";
import { notifications } from "@mantine/notifications";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";

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
  const [hasLoggedIn, setHasLoggedIn] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [openInvalidEmail, setopenInvalidEmail] = useState(false)
  const searchparams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const errorParam = searchparams.get("error");
    if(errorParam === "invalid_email"){
      setopenInvalidEmail(true);
    }
    return;
  }, [searchparams])

  // Notification when user logs in
  useEffect(() => {
    if (user && !hasLoggedIn && !isLoggingOut) {
      setHasLoggedIn(true);
      notifications.show({
        title: 'Welcome',
        message: `You're now logged in`,
        color: 'green',
        icon: <span className="material-symbols-outlined">person</span>,
        autoClose: 2000,
        position: 'top-right'
      });
    }
  }, [user, hasLoggedIn, isLoggingOut]);

  // Notification when user logs out
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();

    setHasLoggedIn(false);
    setIsLoggingOut(true);

    // Notification when user is logging out
    notifications.show({
      title: 'Logging Out',
      message: 'Please wait...',
      color: 'blue',
      icon: <span className="material-symbols-outlined">logout</span>,
      autoClose: 2000,
      position: 'top-right'
    });

    router.push("/auth/logout");
  };

  const icon = () => {
    // conditional rendering of the avatar or the settings icon
    if (isLoggedIn) {
      return <Avatar alt={"logged in user"} />;
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
    <Modal
        title="Invalid Email Address"
        opened={openInvalidEmail}
        withCloseButton={false}
        trapFocus={true}
        closeOnClickOutside={false}
        closeOnEscape={false}
        onClose={() => {}}
      >
        <p className="text-sm mb-4">
          Invalid email was not used. Please log in with an @njit.edu email after logging out.
        </p>
        <div className="flex items-center justify-center gap-8">
          <Button
            size="md"
            w="100%"
            variant="light"
            color="red"
            onClick={() => router.push("/auth/logout")}
          >
            Logout
          </Button>
        </div>
      </Modal>
      <Flex justify="space-between" align={"center"} py={10} px={20}>
        <Title
          className="overflow-hidden whitespace-nowrap my-auto text-ellipsis !text-nowrap "
          order={1}
        >
          Schedule Builder
        </Title>
        <Group wrap="nowrap">
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
                  rightSection={<Icon> login </Icon>}
                  component={"a"}
                  href={"/auth/login"}
                >
                  Login
                </Menu.Item>
              ) : (
                <Menu.Item
                  rightSection={<Icon> logout </Icon>}
                  href={"/auth/logout"}
                  component={"a"}
                  onClick={handleLogout}
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
