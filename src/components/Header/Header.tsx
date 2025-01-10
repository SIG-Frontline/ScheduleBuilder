import { Button, Flex, Title } from "@mantine/core";
import React from "react";
import Icon from "../Icon/Icon";

const Header = () => {
  return (
    <>
      <Flex justify="space-between" py={10} px={20}>
        <Title
          className="overflow-hidden whitespace-nowrap my-auto text-ellipsis !text-nowrap "
          order={1}
        >
          Schedule Builder
        </Title>
        <Button rightSection={<Icon>login</Icon>}>Login</Button>
      </Flex>
    </>
  );
};

export default Header;
