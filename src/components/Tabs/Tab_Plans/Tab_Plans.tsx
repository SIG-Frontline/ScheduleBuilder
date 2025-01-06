import { Button, Group } from "@mantine/core";
import Plans from "./Plans/Plans";
import Icon from "@/components/Icon/Icon";
import { planStore } from "@/lib/planStore";

const Tab_Plans = () => {
  const addPlan = planStore((state) => state.addPlan);
  return (
    <>
      <Group justify="center" py={"14px"}>
        <Button
          onClick={() => {
            addPlan({
              uuid: crypto.randomUUID(),
              name: "my awesome plan" + Math.floor(Math.random() * 100),
              description: "this is a plan",
              term: 202490,
            });
          }}
          leftSection={<Icon>add</Icon>}
        >
          New Plan
        </Button>
        <Button leftSection={<Icon>upload</Icon>}>Import Plan</Button>
      </Group>
      <Plans />
    </>
  );
};

export default Tab_Plans;
