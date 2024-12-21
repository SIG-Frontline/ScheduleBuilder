"use client";

import { Tabs } from "@mantine/core";
import Icon from "../Icon/Icon";

const tabData = [
  { value: "settings", label: "settings panel", icon: "settings" },
  { value: "plans", label: "plans panel", icon: "list" },
  { value: "events", label: "events panel", icon: "calendar_add_on" },
  { value: "insights", label: "insights panel", icon: "lightbulb" },
  { value: "optimizer", label: "optimizer panel", icon: "instant_mix" },
];

export default function Home() {
  return (
    <main>
      <h1 className="text-center text-4xl"> test </h1>

      <Tabs defaultValue="settings" inverted>
        {tabData.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value} pb="xs">
            {tab.label}
          </Tabs.Panel>
        ))}

        <Tabs.List justify="center">
          {tabData.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value}>
              <span className="flex items-center flex-col">
                <Icon>{tab.icon}</Icon>
                {tab.label}{" "}
              </span>
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
    </main>
  );
}
