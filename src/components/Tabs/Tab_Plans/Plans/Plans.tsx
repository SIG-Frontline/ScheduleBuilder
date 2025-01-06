import { useState } from "react";
import { ActionIcon, FloatingIndicator, Menu, Tabs } from "@mantine/core";
import classes from "./Plans.module.css";
import Icon from "@/components/Icon/Icon";
import { planStore } from "@/lib/planStore";

const Plans = () => {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string | null>("1");
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  let tabsData = [
    { value: "1", label: "First tab" },
    { value: "2", label: "Second tab" },
    { value: "3", label: "Third tab" },
  ];

  const plans = planStore((state) => state.plans);
  tabsData = plans.map((plan) => {
    return { value: plan.uuid, label: plan.name };
  });
  return (
    <Tabs
      variant="none"
      orientation="vertical"
      value={value}
      // center
      onChange={setValue}
      className="w-1/2 mx-auto"
    >
      <Tabs.List
        ref={setRootRef}
        grow={true}
        className={[classes.list, "w-full"].join(" ")}
      >
        {tabsData.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            ref={setControlRef(tab.value)}
            className={classes.tab}
          >
            <p>{tab.label}</p>
            <MenuElms tabInfo={tab} />
          </Tabs.Tab>
        ))}
        <FloatingIndicator
          target={value ? controlsRefs[value] : null}
          parent={rootRef}
          className={classes.indicator}
        />
      </Tabs.List>
    </Tabs>
  );
};

export default Plans;
type MenuElmsProps = {
  tabInfo: { value: string; label: string };
};
function MenuElms({ tabInfo }: MenuElmsProps) {
  type DropDownMenuItem = {
    label: string;
    icon: string;
    color?: string;
    onAction: (
      ev: CustomEvent,
      tabinfo: { value: string; label: string }
    ) => void;
  };
  type DropDownMenuItems = {
    [key: string]: DropDownMenuItem[];
  };
  const dropDownMenuItems = {
    "Plan options": [
      {
        label: "Edit",
        icon: "edit",
        onAction: (ev, tabinfo) => console.log("edit"),
      },
      {
        label: "Select for Compare",
        icon: "compare_arrows",
        onAction: (ev, tabinfo) => console.log("select for compare"),
      },
      {
        label: "Share & Export",
        icon: "share",
        onAction: (ev, tabinfo) => console.log("share & export"),
      },
    ],
    "Danger zone": [
      {
        label: "No Guardrails Mode",
        icon: "thumb_down",
        color: "red",
        onAction: (ev, tabinfo) => console.log("no guardrails mode"),
      },
      {
        label: "Delete Plan",
        icon: "delete",
        color: "red",
        onAction: (e) => {
          console.log("delete plan");
          deletePlan(tabInfo.value);
        },
      },
    ],
  } as DropDownMenuItems;
  const deletePlan = planStore((state) => state.removePlan);

  return (
    <Menu trigger="click" shadow="lg" openDelay={100} closeDelay={400}>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          radius={"lg"}
          component="a"
          aria-label="more"
        >
          <Icon>more_vert</Icon>
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {Object.keys(dropDownMenuItems).map((menuLabel) => (
          <div key={menuLabel}>
            <Menu.Label>{menuLabel}</Menu.Label>
            {dropDownMenuItems[menuLabel].map((item) => (
              <Menu.Item
                key={item.label}
                color={item.color}
                leftSection={<Icon>{item.icon}</Icon>}
                onClick={(e) => item.onAction(e, tabInfo)}
              >
                {item.label}
              </Menu.Item>
            ))}
          </div>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
