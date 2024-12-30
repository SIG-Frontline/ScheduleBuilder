import React from "react";
import { Card, Text, Badge } from "@mantine/core";
interface Cal_Event_Props {
  top: number;
  left: number;
  width: number;
  height: number;
}
const Cal_Event = ({ top, left, width, height }: Cal_Event_Props) => {
  return (
    <>
      <Card
        shadow="sm"
        padding="sm"
        radius="md"
        bg={"#E9A1A1"}
        withBorder
        style={{ top: top, left: left, width: width, height: height }}
        className="!absolute"
      >
        <Badge color="white" size="xs" mih={"15px"}>
          <Text className={"!text-black"} size="xs" fw={500}>
            IT 114 ADV PROGRAM FOR INFOR TECH
          </Text>
        </Badge>
        <Text className={"!text-black"} size="xs" fw={400}>
          CKB 234
        </Text>
        <Text className={"!text-black"} size="xs" fw={400}>
          11:30am - 12:50 am
        </Text>
        <Text className={"!text-black"} size="xs" fw={400}>
          Matthew Toegel
        </Text>
      </Card>
    </>
  );
};

export default Cal_Event;
