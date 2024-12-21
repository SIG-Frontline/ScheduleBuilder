"use client";

import { Tabs } from "@mantine/core";
import Icon from "../Icon/Icon";
import Tab_Events from "@/components/Tabs/Tab_Events/Tab_Events";
import Tab_Insights from "@/components/Tabs/Tab_Insights/Tab_Insights";
import Tab_Optimizer from "@/components/Tabs/Tab_Optimizer/Tab_Optimizer";
import Tab_Plans from "@/components/Tabs/Tab_Plans/Tab_Plans";
import Tab_Settings from "@/components/Tabs/Tab_Settings/Tab_Settings";
import classes from "./Nav.module.css";

const tabData = [
  {
    value: "settings",
    label: "settings",
    icon: "settings",
    component: Tab_Settings,
  },
  {
    value: "plans",
    label: "plans",
    icon: "list",
    component: Tab_Plans,
  },
  {
    value: "events",
    label: "events",
    icon: "calendar_add_on",
    component: Tab_Events,
  },
  {
    value: "insights",
    label: "insights",
    icon: "lightbulb",
    component: Tab_Insights,
  },
  {
    value: "optimizer",
    label: "optimizer",
    icon: "instant_mix",
    component: Tab_Optimizer,
  },
];

export default function Home() {
  return (
    <Tabs defaultValue="settings" inverted>
      <Tabs.List justify="start" grow classNames={{ list: classes.list }}>
        {tabData.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value}>
            <span className="flex items-center flex-col">
              <Icon>{tab.icon}</Icon>
              {tab.label}{" "}
            </span>
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {tabData.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value} pb="xs">
          {/* {tab.label} */}
          <tab.component />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
