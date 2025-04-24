import Icon from "@/components/Icon/Icon";
import {
  Accordion,
  AccordionControlProps,
  ActionIcon,
  Badge,
  Center,
  Tooltip,
} from "@mantine/core";
import React from "react";
import PlanMenu from "./PlanMenu";

const PlanItem = ({
  label,
  children,
  uuid,
  temp,
}: {
  label: string;
  children?: React.ReactNode;
  uuid: string;
  temp: boolean;
}) => {
  return (
    <>
      <Accordion.Item value={uuid}>
        <AccordionControl value={uuid} aria-label={label + " credits"}>
          {label}
          {temp && (
            <Tooltip label="This plan will not be saved after you leave this page!">
              <Badge ml="sm">Preview Only</Badge>
            </Tooltip>
          )}
        </AccordionControl>
        <Accordion.Panel>{children}</Accordion.Panel>
      </Accordion.Item>
    </>
  );
};

export default PlanItem;

function AccordionControl(props: AccordionControlProps) {
  return (
    <Center>
      <Accordion.Control {...props} />
      <PlanMenu uuid={props.value as string}>
        <ActionIcon size="lg" variant="subtle" color="gray">
          <Icon>more_vert</Icon>
        </ActionIcon>
      </PlanMenu>
    </Center>
  );
}
