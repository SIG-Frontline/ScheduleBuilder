import { planStore } from "@/lib/planStore";
import {
  ActionIcon,
  Badge,
  Group,
  Menu,
  Radio,
  Stack,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import ShareModal from "./ShareModal/ShareModal";
import Icon from "@/components/Icon/Icon";
import { useDisclosure } from "@mantine/hooks";

export function humanReadableTerm(term: string) {
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
  const [ShareModalOpen, setShareModalOpen] = useState<boolean>(false);

  type MenuElmsProps = {
    tabInfo: { value: string; label: string };
    opened?: boolean;
    setOpenMenu: (value: string | null) => void;
  };
  function MenuElms({ tabInfo, opened, setOpenMenu }: MenuElmsProps) {
    type DropDownMenuItem = {
      label: string;
      icon: string;
      color?: string;
      onAction: (tabinfo: { value: string; label: string }) => void;
    };
    type DropDownMenuItems = {
      [key: string]: DropDownMenuItem[];
    };
    // const [ShareModalOpen, { open, close }] = useDisclosure(false);
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
          onAction: () => setShareModalOpen(true),
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
      <>
        <ShareModal
          opened={ShareModalOpen ?? false}
          onClose={() => setShareModalOpen(false)}
        ></ShareModal>
        <Menu
          onClose={() => {
            setOpenMenu(null);
          }}
          trigger="click"
          shadow="lg"
          openDelay={100}
          closeDelay={400}
          opened={openedMenu}
          onChange={setOpenedMenu}
        >
          <Menu.Target>
            <ActionIcon
              onClick={() => setOpenMenu(tabInfo.value)}
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
      </>
    );
  }
  const plans = planStore((state) => state.plans);
  const selectPlan = planStore((state) => state.selectPlan);
  const value = planStore((state) => state.currentSelectedPlan);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const cards = plans.map((plan) => (
    <Radio.Card
      p={"sm"}
      radius="md"
      value={plan.uuid}
      key={plan.uuid}
      className={plan.uuid === value ? "shadow-lg border border-primary" : ""}
      onContextMenu={(e) => {
        e.preventDefault();
        setOpenMenu(plan.uuid);
      }}
    >
      <Group justify="space-between">
        <Text c={plan.uuid === value ? "dark" : "dimmed"}>{plan.name}</Text>
        <Group>
          <Badge variant="light">
            <Text>{humanReadableTerm(plan.term.toString())}</Text>
          </Badge>
          <MenuElms
            tabInfo={{ value: plan.uuid, label: plan.name }}
            opened={openMenu === plan.uuid}
            setOpenMenu={setOpenMenu}
          />
        </Group>
      </Group>
    </Radio.Card>
  ));
  return (
    <>
      <Radio.Group
        value={value}
        onChange={(value) => selectPlan(value)}
        aria-label="Choose a plan"
      >
        {ShareModalOpen}
        <Stack p="md" gap="xs">
          {cards}
        </Stack>
      </Radio.Group>
    </>
  );
};
export default Plans;
