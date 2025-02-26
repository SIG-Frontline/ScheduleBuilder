import { planStore } from "@/lib/client/planStore";

import Icon from "@/components/Icon/Icon";
import {
  Accordion,
  ActionIcon,
  AccordionControlProps,
  Center,
  Divider,
} from "@mantine/core";
import { prettyTermText } from "@/lib/client/prettyTermText";
const Tab_Plans = () => {
  const plan_store = planStore();
  const plans = plan_store.plans;
  //get a list of all the terms in the plans
  const terms = Array.from(new Set(plans.map((plan) => plan.term)));
  console.log(terms);

  return (
    <>
      {terms.map((term) => (
        <>
          <Divider my="md" label={prettyTermText(term, 2)} />
          <Accordion chevronPosition="left" maw={400} mx="auto">
            <Accordion.Item value="item-1">
              <AccordionControl>Control 1</AccordionControl>
              <Accordion.Panel>Panel 1</Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="item-2">
              <AccordionControl>Control 2</AccordionControl>
              <Accordion.Panel>Panel 2</Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="item-3">
              <AccordionControl>Control 3</AccordionControl>
              <Accordion.Panel>Panel 3</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </>
      ))}
    </>
  );
};

export default Tab_Plans;

function AccordionControl(props: AccordionControlProps) {
  return (
    <Center>
      <Accordion.Control {...props} />
      <ActionIcon size="lg" variant="subtle" color="gray">
        <Icon>more_vert</Icon>
      </ActionIcon>
    </Center>
  );
}
