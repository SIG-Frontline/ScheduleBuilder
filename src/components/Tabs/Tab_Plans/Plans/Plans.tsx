import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  // FloatingIndicator,
  Menu,
  Tabs,
} from "@mantine/core";
import classes from "./Plans.module.css";
import Icon from "@/components/Icon/Icon";
import { planStore } from "@/lib/planStore";

function humanReadableTerm(term: string) {
  //regex to check if the term is in the format of 4 digits followed by 2 digits
  const termRegex = /^[0-9]{4}[0-9]{2}$/;
  if (!termRegex.test(term)) {
    return "??";
  }
  //split off the last 2 digits and the first 4
  const year = term.slice(0, 4);
  const semester = term.slice(4);
  switch (semester) {
    case "90":
      return `F' ${year}`;
    case "10":
      return `S' ${year}`;
    case "50":
      return `Su' ${year}`;
    case "95":
      return `W' ${year}`;
    default: //if the semester is not one of the above, return the year
      return `?? ${year}`;
  }
}

const Plans = () => {
  // const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const plans = planStore((state) => state.plans);
  const selectPlan = planStore((state) => state.selectPlan);
  // const value = planStore((state) => state.currentSelectedPlan);
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  let tabsData = [];

  tabsData = plans.map((plan) => {
    return { value: plan.uuid, label: plan.name, term: plan.term };
  });
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Tabs
      variant="none"
      orientation="vertical"
      value={plans.find((plan) => plan.selected)?.uuid}
      // center
      onChange={(e: string | null) => {
        if (!e) {
          return;
        }
        selectPlan(e);
      }}
      className="w-4/5 mx-auto"
    >
      <Tabs.List
        // ref={setRootRef}
        grow={true}
        className={[classes.list, "w-full"].join(" ")}
      >
        {tabsData.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            onClick={() => selectPlan(tab.value)}
            ref={setControlRef(tab.value)}
            className={classes.tab}
            onContextMenu={(e) => {
              e.preventDefault();
              console.log("right click");
              //to make this open the menu, we need to set the opened prop to true
              // that can be done by using the state
              setOpened(tab.value);
            }}
          >
            <p>{tab.label}</p>
            <Badge variant="light" color="gray" size="lg" radius="lg">
              {humanReadableTerm(tab.term.toString())}
            </Badge>
            <MenuElms tabInfo={tab} opened={opened === tab.value} />
          </Tabs.Tab>
        ))}
        {/* <FloatingIndicator
          target={controlsRefs[value as string]}
          parent={rootRef}
          className={classes.indicator}
        /> */}
      </Tabs.List>
    </Tabs>
  );
};

export default Plans;
type MenuElmsProps = {
  tabInfo: { value: string; label: string };
  opened?: boolean;
};
function MenuElms({ tabInfo, opened }: MenuElmsProps) {
  type DropDownMenuItem = {
    label: string;
    icon: string;
    color?: string;
    onAction: (tabinfo: { value: string; label: string }) => void;
  };
  type DropDownMenuItems = {
    [key: string]: DropDownMenuItem[];
  };
  const dropDownMenuItems = {
    "Plan options": [
      {
        label: "Edit",
        icon: "edit",
        onAction: () => console.log("edit"),
      },
      {
        label: "Select for Compare",
        icon: "compare_arrows",
        onAction: () => console.log("select for compare"),
      },
      {
        label: "Share & Export",
        icon: "share",
        onAction: () => console.log("share & export"),
      },
    ],
    "Danger zone": [
      {
        label: "No Guardrails Mode",
        icon: "thumb_down",
        color: "red",
        onAction: () => console.log("no guardrails mode"),
      },
      {
        label: "Delete Plan",
        icon: "delete",
        color: "red",
        onAction: () => {
          console.log("delete plan");
          deletePlan(tabInfo.value);
        },
      },
    ],
  } as DropDownMenuItems;
  const deletePlan = planStore((state) => state.removePlan);
  const [openedMenu, setOpenedMenu] = useState<boolean | undefined>(false);
  //when opened is true, force the menu to open
  // if (opened) {
  //   setOpenedMenu(true);
  // }
  useEffect(() => {
    setOpenedMenu(opened);
  }, [opened]);

  return (
    <Menu
      trigger="click"
      shadow="lg"
      openDelay={100}
      closeDelay={400}
      opened={openedMenu}
      onChange={setOpenedMenu}
    >
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
                onClick={() => item.onAction(tabInfo)}
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
