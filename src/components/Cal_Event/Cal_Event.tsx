import React from "react";
import { Card, Text, Badge } from "@mantine/core";
const Cal_Event = ({}) => {
  return (
    <>
      <Card
        shadow="sm"
        padding="lg"
        maw={"20em"} //temporary
        radius="md"
        bg={"#E9A1A1"}
        withBorder
      >
        <Badge color="white" size="sm">
          <Text className={"!text-black"} fw={500}>
            IT 114 ADV PROGRAM FOR INFOR TECH
          </Text>
        </Badge>
        <Text className={"!text-black"} fw={400}>
          CKB 234
        </Text>
        <Text className={"!text-black"} fw={400}>
          11:30am - 12:50 am
        </Text>
        <Text className={"!text-black"} fw={400}>
          Matthew Toegel
        </Text>
      </Card>
    </>
  );
};

export default Cal_Event;
