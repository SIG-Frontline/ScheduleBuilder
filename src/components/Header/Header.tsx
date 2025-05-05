import {
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  Group,
  Menu,
  Modal,
  MultiSelect,
  Popover,
  Space,
  Stack,
  Switch,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import React, { useState } from "react";
import Icon from "../Icon/Icon";
import { useUser } from "@auth0/nextjs-auth0";
import { dayStore } from "@/lib/client/dayStore";
import { notifications } from "@mantine/notifications";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  checkIfModalNeeded,
  loadLocalPlans,
  planStore,
  syncPlans,
} from "@/lib/client/planStore";
import { useMediaQuery } from "@mantine/hooks";
import { bugReportLink, feedbackForm } from "@/lib/forms";
import { WelcomeModal } from "@/components/Shell/Shell";

const Header = () => {
  const plan_store = planStore();
  const { isOpen: isWelcomeModalOpen } = React.useContext(WelcomeModal);

  const days = [
    { label: "Su", value: "0" },
    { label: "Mo", value: "1" },
    { label: "Tu", value: "2" },
    { label: "We", value: "3" },
    { label: "Th", value: "4" },
    { label: "Fr", value: "5" },
    { label: "Sa", value: "6" },
  ];
  const day_store = dayStore();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const largerThanSm = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  const searchparams = useSearchParams();
  const [openInvalidEmail, setopenInvalidEmail] = useState(false);
  const { user } = useUser();
  const isLoggedIn = Boolean(user);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openPlanSyncModal, setOpenPlanSyncModal] = useState(false);
  const [alreadyHandledSync, setAlreadyHandledSync] = useState(false);
  const [openConfirmPlanSyncModal, setOpenConfirmPlanSyncModal] =
    useState(false);

  useEffect(() => {
    const errorParam = searchparams.get("error");
    if (
      errorParam === "invalid_email" ||
      sessionStorage.getItem("invalidLogin") == "true"
    ) {
      setopenInvalidEmail(true);
      sessionStorage.setItem("invalidLogin", "true");
    }
    return;
  }, [searchparams]);

  // Notification when user logs in
  useEffect(() => {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigation?.type !== "reload") {
      if (user && !hasLoggedIn && !isLoggingOut && !isWelcomeModalOpen) {
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
    }
  }, [user, hasLoggedIn, isLoggingOut, isWelcomeModalOpen]);

  useEffect(() => {
    const shouldClearPlans = localStorage.getItem("shouldClearPlans");
    if (shouldClearPlans) {
      plan_store.clearPlans();
      localStorage.removeItem("shouldClearPlans");
    }
  }, []);

  useEffect(() => {
    const runSync = async () => {
      if (alreadyHandledSync) return;
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation?.type !== "reload") {
        const shouldNotify = await checkIfModalNeeded();
        if (!alreadyHandledSync && shouldNotify) {
          setOpenPlanSyncModal(true);
        } else if (hasLoggedIn) {
          syncPlans(false);
        } else {
          await loadLocalPlans();
        }
      }
    };

    runSync();
  }, [hasLoggedIn, alreadyHandledSync]);

  const handleModalClick = async (saveLocal: boolean) => {
    setAlreadyHandledSync(true);
    setOpenPlanSyncModal(false);
    await syncPlans(saveLocal);
    setOpenConfirmPlanSyncModal(false);
  };

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

    router.push("/auth/logout");

    // Set a flag so that plans are cleared after the page reloads
    // If we clear the plans here, it causes a visual flicker as they disappear before logout.
    // By clearing plans after page reload, the transition appears smoother to the user.
    // The plan clear logic occurs in Cal_Grid component when this flag is set
    localStorage.setItem("shouldClearPlans", "true");
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
      <Modal
        title="Invalid Email Address"
        opened={openInvalidEmail}
        withCloseButton={false}
        trapFocus={true}
        closeOnClickOutside={false}
        closeOnEscape={false}
        onClose={() => {}}
      >
        <p className="text-sm mb-4">
          Invalid email was not used. Please start the log out process below and
          try logging back in with an @njit.edu email.
        </p>
        <div className="flex items-center justify-center gap-8">
          <Button
            size="md"
            w="100%"
            variant="light"
            color="red"
            onClick={() => {
              sessionStorage.setItem("invalidLogin", "false");
              router.push("/auth/logout");
            }}
          >
            Logout
          </Button>
        </div>
      </Modal>
      <Modal.Stack>
        <Modal
          title="Select Plan Sync Option"
          opened={openPlanSyncModal}
          withCloseButton={false}
          trapFocus={false}
          closeOnClickOutside={false}
          closeOnEscape={false}
          onClose={() => {}}
        >
          <p className="text-md mb-4">
            It looks like you have a plan stored locally that's not stored in
            your account, would you like to save this plan to your account or
            discard it?
          </p>
          <div className="flex items-center justify-center gap-8">
            <Button
              size="md"
              w="30%"
              variant="light"
              styles={{
                label: {
                  fontSize: largerThanSm ? "16px" : "14px",
                },
              }}
              onClick={() => {
                setOpenConfirmPlanSyncModal(true);
                setOpenPlanSyncModal(false);
              }}
            >
              Discard
            </Button>
            <Button
              size="md"
              w="30%"
              variant="light"
              styles={{
                label: {
                  fontSize: largerThanSm ? "16px" : "14px",
                },
              }}
              onClick={() => handleModalClick(true)}
            >
              Save
            </Button>
          </div>
        </Modal>
        <Modal
          title="Select Plan Sync Option"
          opened={openConfirmPlanSyncModal}
          withCloseButton={false}
          trapFocus={false}
          closeOnClickOutside={false}
          closeOnEscape={false}
          onClose={() => {}}
        >
          <p className="text-md mb-4">
            Are you sure you want to discard your local plan?
          </p>
          <div className="flex items-center justify-center gap-8">
            <Button
              size="md"
              w="30%"
              variant="light"
              styles={{
                label: {
                  fontSize: largerThanSm ? "16px" : "14px",
                },
              }}
              onClick={() => handleModalClick(true)}
            >
              No
            </Button>
            <Button
              size="md"
              w="30%"
              variant="light"
              styles={{
                label: {
                  fontSize: largerThanSm ? "16px" : "14px",
                },
              }}
              onClick={() => handleModalClick(false)}
            >
              Yes
            </Button>
          </div>
        </Modal>
      </Modal.Stack>
      <Flex justify="space-between" align={"center"} py={10} px={20}>
        <Title
          className="overflow-hidden whitespace-nowrap my-auto text-ellipsis !text-nowrap "
          order={1}
        >
          Schedule Builder
        </Title>
        <Group wrap="nowrap">
          <Menu
            shadow="md"
            width={"200"}
            closeOnItemClick={false}
            closeOnClickOutside={true}
          >
            <Menu.Target>
              <ActionIcon variant="light" aria-label="Settings">
                <Icon>more_vert</Icon>
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Flex align="center" gap="sm" my="sm">
                <Divider w="10%" /> {/* left line: 1/3 width */}
                <Text fw={600}>Settings</Text>
                <Divider flex={1} /> {/* right line grows to fill the rest */}
              </Flex>

              <Stack mx="md">
                <Text fw={400} size="sm">
                  Visible Days
                </Text>
                <Checkbox.Group
                  my={0}
                  value={[0, 1, 2, 3, 4, 5, 6]
                    .filter((day) => !day_store.days.includes(day)) // Calculate shown days
                    .map((day) => day.toString())}
                  onChange={(values) => {
                    // Update hidden days by subtracting shown days from the full list
                    const shownDays = values.map((day) => parseInt(day));
                    const hiddenDays = [0, 1, 2, 3, 4, 5, 6].filter(
                      (day) => !shownDays.includes(day)
                    );
                    day_store.setDays(hiddenDays);
                  }}
                >
                  <Stack mx="md" my={0}>
                    {days.map((day) => (
                      <Checkbox
                        my={0}
                        key={day.value}
                        value={day.value}
                        label={day.label}
                      />
                    ))}
                  </Stack>
                </Checkbox.Group>
                <Text fw={400} size="sm">
                  Toggle Color Scheme
                </Text>
                <Switch
                  checked={colorScheme === "dark"}
                  size="md"
                  offLabel={<Icon className="text-yellow-400">light_mode</Icon>}
                  onLabel={<Icon>dark_mode</Icon>}
                  onClick={toggleColorScheme}
                />
              </Stack>
              <Flex align="center" gap="sm" my="sm">
                <Divider w="10%" /> {/* left line: 1/3 width */}
                <Text fw={600}>Feedback</Text>
                <Divider flex={1} /> {/* right line grows to fill the rest */}
              </Flex>
              <Menu.Item
                leftSection={<Icon> error </Icon>}
                onClick={() => {
                  const userAgent = encodeURIComponent(navigator.userAgent);
                  const screenInfo = encodeURIComponent(
                    `${window.innerWidth}x${window.innerHeight}, DPR: ${window.devicePixelRatio}`
                  );
                  const timestamp = encodeURIComponent(
                    new Date().toISOString()
                  );

                  const formUrl =
                    `${bugReportLink}?usp=pp_url` +
                    `&entry.798766012=${userAgent}` +
                    `&entry.1633347189=${screenInfo}` +
                    `&entry.1561839137=${timestamp}` +
                    `&entry.1425119412=${user?.sub ? user.sub : "unauth"}`;

                  window.open(formUrl);
                }}
              >
                Bug Report
              </Menu.Item>
              <Menu.Item
                leftSection={<Icon> question_answer </Icon>}
                onClick={() => {
                  window.open(feedbackForm);
                }}
              >
                Feedback Form
              </Menu.Item>
              <Divider my="xs" labelPosition="left" />
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
                  color="red"
                  rightSection={<Icon> logout </Icon>}
                  href={"/auth/logout"}
                  component={"a"}
                  onClick={handleLogout}
                >
                  <Text fw={600}>Logout</Text>
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
