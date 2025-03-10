import { Avatar, Button, Flex, Group, Title } from "@mantine/core";
import React from "react";
import Icon from "../Icon/Icon";
import { useUser } from "@auth0/nextjs-auth0/client";
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

const Header = () => {
  const { user } = useUser();
  const isLoggedIn = Boolean(user);
  const [hasLoggedIn, setHasLoggedIn] = React.useState(false);

  // Notification when user logs in
  useEffect(() => {
    if (user && !hasLoggedIn) {
      setHasLoggedIn(true);
      notifications.show({
        title: 'Welcome',
        message: `You're logged in as ${user.name}`,
        color: 'green',
        icon: <span className="material-symbols-outlined">person</span>,
        autoClose: 3000,
        position: 'top-right'
      });
    }
  }, [user, hasLoggedIn]);

  // Notification when user logs out
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();

    // Notification when user is logging out
    notifications.show({
      title: 'Logging Out',
      message: 'Please wait...',
      color: 'blue',
      icon: <span className="material-symbols-outlined">logout</span>,
      autoClose: 2000,
      position: 'top-right'
    });

    // Show logged out notification before redirect
    setTimeout(() => {
      notifications.show({
        title: 'Logged Out',
        message: 'You have been successfully logged out',
        color: 'blue',
        icon: <span className="material-symbols-outlined">logout</span>,
        autoClose: 5000,
        position: 'top-right'
      });
    }, 1000);

    // Redirect after both notifications
    setTimeout(() => {
      window.location.href = "/api/auth/logout";
    }, 2000);
  };
  return (
    <>
      <Flex justify="space-between" py={10} px={20}>
        <Title
          className="overflow-hidden whitespace-nowrap my-auto text-ellipsis !text-nowrap "
          order={1}
        >
          Schedule Builder
        </Title>
        {isLoggedIn ? (
          <Group>
            <Button
              component={"a"}
              href={"/api/auth/logout"}
              rightSection={<Icon>logout</Icon>}
              onClick={handleLogout}
            >
              Logout
            </Button>
            {/* <Button onClick={uploadPlan} rightSection={<Icon>upload</Icon>}>
              Upload Plan
            </Button> */}
            <Avatar src={user?.picture} alt={user?.name ?? ""} />
          </Group>
        ) : (
          <Button
            component={"a"}
            href={"/api/auth/login"}
            rightSection={<Icon>login</Icon>}
          >
            Login
          </Button>
        )}
      </Flex>
    </>
  );
};

export default Header;
