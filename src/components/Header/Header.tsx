'use client';

import {
  ActionIcon,
  Avatar,
  Button,
  Flex,
  Group,
  Menu,
  Modal,
  MultiSelect,
  Popover,
  Space,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import React, { useState, Suspense } from 'react';
import Icon from '../Icon/Icon';
import { useUser } from '@auth0/nextjs-auth0';
import { dayStore } from '@/lib/client/dayStore';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  checkIfModalNeeded,
  loadLocalPlans,
  planStore,
  syncPlans,
} from '@/lib/client/planStore';
import { useMediaQuery } from '@mantine/hooks';
import { bugReportLink, feedbackForm } from '@/lib/forms';
import { WelcomeModal } from '@/components/Shell/Shell';
import InvalidEmailChecker from './InvalidEmailChecker';

const Header = () => {
  const plan_store = planStore();
  const { isOpen: isWelcomeModalOpen } = React.useContext(WelcomeModal);

  const days = [
    { label: 'Su', value: '0' },
    { label: 'Mo', value: '1' },
    { label: 'Tu', value: '2' },
    { label: 'We', value: '3' },
    { label: 'Th', value: '4' },
    { label: 'Fr', value: '5' },
    { label: 'Sa', value: '6' },
  ];
  const day_store = dayStore();
  const { toggleColorScheme } = useMantineColorScheme();
  const largerThanSm = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const [openInvalidEmail, setopenInvalidEmail] = useState(false);
  const { user } = useUser();
  const isLoggedIn = Boolean(user);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openPlanSyncModal, setOpenPlanSyncModal] = useState(false);
  const [alreadyHandledSync, setAlreadyHandledSync] = useState(false);
  const [openConfirmPlanSyncModal, setOpenConfirmPlanSyncModal] =
    useState(false);

  // Notification when user logs in
  useEffect(() => {
    const navigation = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming;
    if (navigation?.type !== 'reload') {
      if (user && !hasLoggedIn && !isLoggingOut && !isWelcomeModalOpen) {
        setHasLoggedIn(true);
        notifications.show({
          title: 'Welcome',
          message: `You're now logged in`,
          color: 'green',
          icon: <span className="material-symbols-outlined">person</span>,
          autoClose: 2000,
          position: 'top-right',
        });
      }
    }
  }, [user, hasLoggedIn, isLoggingOut, isWelcomeModalOpen]);

  useEffect(() => {
    const shouldClearPlans = localStorage.getItem('shouldClearPlans');
    if (shouldClearPlans) {
      plan_store.clearPlans();
      localStorage.removeItem('shouldClearPlans');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const runSync = async () => {
      if (alreadyHandledSync) return;
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      if (navigation?.type !== 'reload') {
        const shouldNotify = await checkIfModalNeeded();
        if (!alreadyHandledSync && shouldNotify) {
          setOpenPlanSyncModal(true);
        } else if (hasLoggedIn) {
          await syncPlans(false);
        } else {
          await loadLocalPlans();
        }
      }
    };

    void runSync();
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
      title: 'Logging Out',
      message: 'Please wait...',
      color: 'blue',
      icon: <span className="material-symbols-outlined">logout</span>,
      autoClose: 2000,
      position: 'top-right',
    });

    router.push('/auth/logout');

    // Set a flag so that plans are cleared after the page reloads
    // If we clear the plans here, it causes a visual flicker as they disappear before logout.
    // By clearing plans after page reload, the transition appears smoother to the user.
    // The plan clear logic occurs in Cal_Grid component when this flag is set
    localStorage.setItem('shouldClearPlans', 'true');
  };

  const icon = () => {
    // conditional rendering of the avatar or the settings icon
    if (isLoggedIn) {
      return <Avatar alt={'logged in user'} />;
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
      <Suspense fallback={null}>
        <InvalidEmailChecker onDetected={() => setopenInvalidEmail(true)} />
      </Suspense>

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
              sessionStorage.setItem('invalidLogin', 'false');
              router.push('/auth/logout');
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
            It looks like you have a plan stored locally that&apos;s not stored
            in your account, would you like to save this plan to your account or
            discard it?
          </p>
          <div className="flex items-center justify-center gap-8">
            <Button
              size="md"
              w="30%"
              variant="light"
              styles={{
                label: {
                  fontSize: largerThanSm ? '16px' : '14px',
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
                  fontSize: largerThanSm ? '16px' : '14px',
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
                  fontSize: largerThanSm ? '16px' : '14px',
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
                  fontSize: largerThanSm ? '16px' : '14px',
                },
              }}
              onClick={() => handleModalClick(false)}
            >
              Yes
            </Button>
          </div>
        </Modal>
      </Modal.Stack>
      <Flex justify="space-between" align={'center'} py={10} px={20}>
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
            closeOnClickOutside={true}
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
                  <Group>
                    {/* <Group m="sm"> */}
                    {/* <Tooltip label="Toggle color scheme">
                    
                    </Tooltip>
                    <Text size="md">Color Scheme</Text> */}
                    {/* </Group> */}
                    <Space h="md" />
                    <Text size="md" ta={'center'}>
                      Days of the Week
                    </Text>
                    <MultiSelect
                      comboboxProps={{
                        withinPortal: false,
                      }}
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
                  </Group>
                </Popover.Dropdown>
              </Popover>
              <Menu.Item
                leftSection={<Icon> error </Icon>}
                onClick={() => {
                  const userAgent = encodeURIComponent(navigator.userAgent);
                  const screenInfo = encodeURIComponent(
                    `${window.innerWidth}x${window.innerHeight}, DPR: ${window.devicePixelRatio}`,
                  );
                  const timestamp = encodeURIComponent(
                    new Date().toISOString(),
                  );

                  const formUrl =
                    `${bugReportLink}?usp=pp_url` +
                    `&entry.798766012=${userAgent}` +
                    `&entry.1633347189=${screenInfo}` +
                    `&entry.1561839137=${timestamp}` +
                    `&entry.1425119412=${user?.sub ? user.sub : 'unauth'}`;

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
              {!isLoggedIn ? (
                <Menu.Item
                  rightSection={<Icon> login </Icon>}
                  component={'a'}
                  href={'/auth/login'}
                >
                  Login
                </Menu.Item>
              ) : (
                <Menu.Item
                  rightSection={<Icon> logout </Icon>}
                  href={'/auth/logout'}
                  component={'a'}
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
