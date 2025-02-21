import { Avatar, Button, Flex, Group, Title } from "@mantine/core";
import React from "react";
import Icon from "../Icon/Icon";
import { useUser } from "@auth0/nextjs-auth0/client";

const Header = () => {
  const { user } = useUser();
  const isLoggedIn = Boolean(user);
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
