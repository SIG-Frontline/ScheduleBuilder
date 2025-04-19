import Icon from "@/components/Icon/Icon";
import {
    Accordion,
    AccordionControlProps,
    ActionIcon,
    Center,
} from "@mantine/core";
import React from "react";
import PlanMenu from "./PlanMenu";

const PlanItem = ({
    label,
    children,
    uuid,
}: {
    label: string;
    children?: React.ReactNode;
    uuid: string;
}) => {
    return (
        <>
            <Accordion.Item value={uuid}>
                <AccordionControl value={uuid} aria-label={label + "redits"}>
                    {label}
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
