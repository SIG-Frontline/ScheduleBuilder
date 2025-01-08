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
              uuid: (() => {
                function uuidv4() {
                  return "10000000-1000-4000-8000-100000000000".replace(
                    /[018]/g,
                    (c) =>
                      (
                        +c ^
                        (crypto.getRandomValues(new Uint8Array(1))[0] &
                          (15 >> (+c / 4)))
                      ).toString(16)
                  );
                }
                return uuidv4();
              })(),
              name: "my awesome plan" + Math.floor(Math.random() * 100),
              description: "this is a plan",
              term: 202490,
              selected: false,
              courses: [],
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
