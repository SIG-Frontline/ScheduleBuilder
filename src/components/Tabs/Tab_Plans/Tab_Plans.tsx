import { Button, Group } from "@mantine/core";
import Plans from "./Plans/Plans";
import Icon from "@/components/Icon/Icon";

const Tab_Plans = () => {
  return (
    <>
      <Group justify="center" py={"14px"}>
        <Button leftSection={<Icon>add</Icon>}>New Plan</Button>
        <Button leftSection={<Icon>upload</Icon>}>Import Plan</Button>
      </Group>
      <Plans />
    </>
  );
};

export default Tab_Plans;
