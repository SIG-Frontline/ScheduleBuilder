"use client";

import { Tabs } from "@mantine/core";
import Icon from "../Icon/Icon";
import Tab_Events from "@/components/Tabs/Tab_Events/Tab_Events";
import Tab_Insights from "@/components/Tabs/Tab_Insights/Tab_Insights";
import Tab_Optimizer from "@/components/Tabs/Tab_Optimizer/Tab_Optimizer";
import Tab_Plans from "@/components/Tabs/Tab_Plans/Tab_Plans";
import Tab_Settings from "@/components/Tabs/Tab_Settings/Tab_Settings";
import classes from "./Nav.module.css";
import Search from "../Search/Search";
import { createRef } from "react";

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
  const tabRef = createRef<HTMLDivElement>();

  return (
    <>
      <Search />
      <Tabs defaultValue="settings" inverted>
        <Tabs.List
          justify="start"
          grow
          className={"no-scrollbar"}
          classNames={{ list: classes.list }}
          ref={tabRef}
          onWheel={(e) => {
            // comment out to preserve default scrolling:
            // e.preventDefault();
            if (e.deltaY > 0 && tabRef.current) {
              tabRef.current.scrollLeft += 100;
            } else if (e.deltaY < 0 && tabRef.current) {
              tabRef.current.scrollLeft -= 100;
            }
          }}
        >
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
    </>
  );
}
