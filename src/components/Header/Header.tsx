import {
  ActionIcon,
  Avatar,
  Button,
  Flex,
  Group,
  Menu,
  MultiSelect,
  Popover,
  Select,
  Space,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import React from "react";
import Icon from "../Icon/Icon";
import { useUser } from "@auth0/nextjs-auth0";
import { dayStore } from "@/lib/client/dayStore";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";

const Header = () => {
  const days = [
    { label: "Su", value: "0" },
    { label: "Mo", value: "1" },
    { label: "Tu", value: "2" },
    { label: "We", value: "3" },
    { label: "Th", value: "4" },
    { label: "Fr", value: "5" },
    { label: "Sa", value: "6" },
  ];
  const majors = [
    {
      label: "Applied Mathematics and Applied Physics",
      value: "applied_mathematics_and_applied_physics",
    },
    { label: "Applied Physics", value: "applied_physics" },
    { label: "Architecture", value: "architecture" },
    { label: "BioChemistry", value: "biochemistry" },
    { label: "Biology", value: "biology" },
    {
      label: "Biology and Law, Technology and Culture",
      value: "biology_and_law_technology_and_culture",
    },
    {
      label: "Biology and Mathematical Sciences",
      value: "biology_and_mathematical_sciences",
    },
    { label: "Biomedical Engineering", value: "biomedical_engineering" },
    { label: "Business", value: "business" },
    {
      label: "Business & Information Systems",
      value: "business_and_information_systems",
    },
    { label: "Chemical Engineering", value: "chemical_engineering" },
    { label: "Chemistry", value: "chemistry" },
    {
      label: "Chemistry & Law, Technology and Culture",
      value: "chemistry_and_law_technology_and_culture",
    },
    { label: "Civil Engineering", value: "civil_engineering" },
    { label: "Communication and Media", value: "communication_and_media" },
    { label: "Computer Engineering", value: "computer_engineering" },
    { label: "Computer Science", value: "computer_science" },
    {
      label: "Computer Science and Applied Physics",
      value: "computer_science_and_applied_physics",
    },
    {
      label: "Computer Science and Mathematical Sciences, Applied Mathematics",
      value: "computer_science_and_mathematical_sciences_applied_mathematics",
    },
    {
      label:
        "Computer Science and Mathematical Sciences, Computational Mathematics",
      value:
        "computer_science_and_mathematical_sciences_computational_mathematics",
    },
    { label: "Computing and Business", value: "computing_and_business" },
    {
      label: "Concrete Industry Management",
      value: "concrete_industry_management",
    },
    {
      label: "Construction Engineering Technology",
      value: "construction_engineering_technology",
    },
    { label: "Cyberpsychology", value: "cyberpsychology" },
    { label: "Data Science", value: "data_science" },
    { label: "Digital Design", value: "digital_design" },
    { label: "Electrical Engineering", value: "electrical_engineering" },
    {
      label: "Electrical and Computer Engineering Technology",
      value: "electrical_and_computer_engineering_technology",
    },
    { label: "Engineering Technology", value: "engineering_technology" },
    { label: "Environmental Science", value: "environmental_science" },
    { label: "Financial Technology", value: "financial_technology" },
    { label: "Forensic Science", value: "forensic_science" },
    { label: "General Engineering", value: "general_engineering" },
    { label: "History", value: "history" },
    {
      label: "Human-Computer Interaction",
      value: "human_computer_interaction",
    },
    { label: "Industrial Design", value: "industrial_design" },
    { label: "Industrial Engineering", value: "industrial_engineering" },
    {
      label: "Industrial Engineering Technology",
      value: "industrial_engineering_technology",
    },
    { label: "Information Systems", value: "information_systems" },
    { label: "Information Technology", value: "information_technology" },
    { label: "Interior Design", value: "interior_design" },
    {
      label: "Law, Technology and Culture",
      value: "law_technology_and_culture",
    },
    {
      label: "Law, Technology and Culture (Patent Law Concentration)",
      value: "law_technology_and_culture_patent_law_concentration",
    },
    {
      label: "Materials Engineering Program",
      value: "materials_engineering_program",
    },
    { label: "Mathematical Sciences", value: "mathematical_sciences" },
    { label: "Mechanical Engineering", value: "mechanical_engineering" },
    {
      label: "Mechanical Engineering Technology",
      value: "mechanical_engineering_technology",
    },
    {
      label: "Physics & Law, Technology and Culture",
      value: "physics_and_law_technology_and_culture",
    },
    {
      label: "Science, Technology and Society/Business and Information Systems",
      value: "science_technology_and_society_business_and_information_systems",
    },
    {
      label: "Science, Technology, & Society",
      value: "science_technology_and_society",
    },
    {
      label: "Surveying Engineering Technology",
      value: "surveying_engineering_technology",
    },
    {
      label: "Theatre Arts and Technology",
      value: "theatre_arts_and_technology",
    },
    {
      label: "Web & Information Systems",
      value: "web_and_information_systems",
    },
  ];
  const day_store = dayStore();
  const { toggleColorScheme } = useMantineColorScheme();

  const { user } = useUser();
  const isLoggedIn = Boolean(user);
  const [hasLoggedIn, setHasLoggedIn] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Notification when user logs in
  useEffect(() => {
    if (user && !hasLoggedIn && !isLoggingOut) {
      setHasLoggedIn(true);
      notifications.show({
        title: "Welcome",
        message: `You're now logged in`,
        color: "green",
        icon: <span className="material-symbols-outlined">person</span>,
        autoClose: 2000,
        position: "top-right",
      });
    }
  }, [user, hasLoggedIn, isLoggingOut]);

  // Notification when user logs out
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();

    setHasLoggedIn(false);
    setIsLoggingOut(true);

    // Notification when user is logging out
    notifications.show({
      title: "Logging Out",
      message: "Please wait...",
      color: "blue",
      icon: <span className="material-symbols-outlined">logout</span>,
      autoClose: 2000,
      position: "top-right",
    });

    // Redirect after both notifications
    setTimeout(() => {
      window.location.href = "/auth/logout";
    }, 2000);
  };

  const icon = () => {
    // conditional rendering of the avatar or the settings icon
    if (isLoggedIn) {
      return <Avatar alt={"logged in user"} />;
    } else {
      return (
        <ActionIcon variant="light" aria-label="Settings">
          <Icon>more_vert</Icon>
        </ActionIcon>
      );
    }
  };
  return (
    <>
      <Flex justify="space-between" align={"center"} py={10} px={20}>
        <Title
          className="overflow-hidden whitespace-nowrap my-auto text-ellipsis !text-nowrap "
          order={1}
        >
          Schedule Builder
        </Title>
        <Group wrap="nowrap">
          <ActionIcon
            // className="m-1"
            variant="light"
            onClick={toggleColorScheme}
          >
            <Icon>
              <p className="dark:hidden">light_mode</p>
              <p className="hidden dark:block">dark_mode</p>
            </Icon>
          </ActionIcon>
          <Menu
            shadow="md"
            width={200}
            closeOnItemClick={false}
            closeOnClickOutside={false}
          >
            <Menu.Target>
              <span className="flex">{icon()}</span>
            </Menu.Target>
            <Menu.Dropdown>
              <Popover withinPortal={false} width={400} withArrow shadow="md">
                <Popover.Target>
                  <Menu.Item leftSection={<Icon> settings </Icon>}>
                    Settings
                  </Menu.Item>
                </Popover.Target>
                <Popover.Dropdown>
                  <Stack>
                    {/* <Group m="sm"> */}
                    {/* <Tooltip label="Toggle color scheme">
                    
                    </Tooltip>
                    <Text size="md">Color Scheme</Text> */}
                    {/* </Group> */}
                    <Select mx="md" label="Major" data={majors}></Select>
                    {/* <Text size="md">Days of the Week</Text> */}
                    <MultiSelect
                      comboboxProps={{ withinPortal: false }}
                      mx="md"
                      label="Hidden days"
                      placeholder="Select hidden days"
                      data={days}
                      maxValues={6}
                      onChange={(values) => {
                        day_store.setDays(values.map((day) => parseInt(day)));
                      }}
                      value={day_store.days.map((day) => day.toString())}
                    />
                  </Stack>
                </Popover.Dropdown>
              </Popover>
              {!isLoggedIn ? (
                <Menu.Item
                  rightSection={<Icon> login </Icon>}
                  component={"a"}
                  href={"/auth/login"}
                >
                  Login
                </Menu.Item>
              ) : (
                <Menu.Item
                  rightSection={<Icon> logout </Icon>}
                  href={"/auth/logout"}
                  component={"a"}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>
    </>
  );
};

export default Header;
