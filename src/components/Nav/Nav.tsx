"use client";

import { ScrollAreaAutosize, Tabs, Transition } from "@mantine/core";
import Icon from "../Icon/Icon";
import Tab_Events from "./Tabs/Tab_Events/Tab_Events";
import Tab_Insights from "./Tabs/Tab_Insights/Tab_Insights";
import Tab_Organizer from "./Tabs/Tab_Organizer/Tab_Organizer";
import Tab_Plans from "./Tabs/Tab_Plans/Tab_Plans";
import Tab_Settings from "./Tabs/Tab_Settings/Tab_Settings";
import classes from "./Nav.module.css";
import Search from "./Search/Search";
import { createRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import FiltersDrawer from "./FiltersDrawer/FiltersDrawer";
import Tab_Sections from "./Tabs/Tab_Sections/Tab_Sections";

const tabData = [
  //this array contains the data for each tab
  //to add a new tab, add a new object to this array in the same format as the others
  //make sure the component you want to render is imported at the top of this file
  {
    value: "plans",
    label: "plans",
    icon: "list",
    component: Tab_Plans,
  },
  {
    value: "sections",
    label: "sections",
    icon: "view_timeline",
    component: Tab_Sections,
  },
  {
    value: "settings",
    label: "settings",
    icon: "settings",
    component: Tab_Settings,
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
    value: "organizer",
    label: "organizer",
    icon: "instant_mix",
    component: Tab_Organizer,
  },
];

export default function Nav() {
  const matches = useMediaQuery(
    "only screen and (orientation: landscape) and (min-width: 1201px)" //same as in Shell.tsx
  );
  const tabRef = createRef<HTMLDivElement>();

  const [activeTab, setActiveTab] = useState<string | null>(tabData[0].value);
  return (
    <>
      <div>
        <div className="relative block">
          <Search
            onFocused={() => {
              //deselct the tab on mobile when search is focused
              if (matches) return;
              localStorage.setItem("lastTab", activeTab || tabData[0].value);
              setActiveTab(null);
            }}
            onBlurred={() => {
              //reselect the last tab on mobile when search is out of focus
              if (matches || activeTab) return;
              setActiveTab(localStorage.getItem("lastTab") ?? tabData[0].value);
            }}
          />

          <FiltersDrawer />
        </div>
        <Tabs
          defaultValue="settings"
          inverted
          value={activeTab}
          onChange={(value) => {
            // console.log(value);
            if (value === activeTab) {
              localStorage.setItem("lastTab", value || tabData[0].value);
              setActiveTab(null);
              return;
            }
            setActiveTab(value);
          }}
        >
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
                <span className="flex items-center flex-col capitalize">
                  <Icon>{tab.icon}</Icon>
                  {tab.label}
                </span>
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {tabData.map((tab) => (
            <Transition
              mounted={activeTab === tab.value}
              transition="fade"
              key={tab.value}
              duration={400}
              timingFunction="ease"
            >
              {(styles) => (
                <Tabs.Panel value={tab.value} pb="xs" style={styles}>
                  <ScrollAreaAutosize
                    scrollbars="y"
                    mah={matches ? "90dvh" : "48dvh"}
                  >
                    {/* using dvh unit above to factor in the mobile browser address bar*/}
                    <tab.component />
                  </ScrollAreaAutosize>
                </Tabs.Panel>
              )}
            </Transition>
          ))}
        </Tabs>
      </div>
    </>
  );
}
