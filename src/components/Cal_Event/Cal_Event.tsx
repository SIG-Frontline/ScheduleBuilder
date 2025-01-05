import { Card, Text, Badge, Modal, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
interface Cal_Event_Props {
  top: number;
  left: number;
  width: number;
  height: number;
}
const Cal_Event = ({ top, left, width, height }: Cal_Event_Props) => {
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 50em)");
  return (
    <>
      <Card
        onClick={() => open()}
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
      <Modal
        centered
        size="lg"
        opened={opened}
        onClose={close}
        title="Course Details"
        fullScreen={isMobile}
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <Title order={3}>IT 114 </Title>
        <Text>Advanced Programming for Information Technology</Text>
        <Text>CKB 234</Text>
        <Text>11:30am - 12:50 am</Text>
        <Text>Matthew Toegel</Text>
        <Text>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit nobis
          ducimus velit veritatis autem eaque dicta ullam eum, illum, omnis quo
          veniam quos perferendis nemo ea temporibus ad nam officiis.
        </Text>
      </Modal>
    </>
  );
};

export default Cal_Event;
