import Icon from '@/components/Icon/Icon';
import { planStore } from '@/lib/client/planStore';
import { Button, Menu, Popover, Textarea, TextInput } from '@mantine/core';
import html2canvas from 'html2canvas';
import React from 'react';

const PlanMenu = ({
  children,
  uuid,
}: {
  children?: React.ReactNode;
  uuid: string;
}) => {
  const plan_store = planStore();

  function jsonSave() {
    const json = JSON.stringify(plan_store.getPlan(uuid));
    //make it a downloadable file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  function imageSave() {
    const elm: HTMLDivElement = document.querySelector(
      '.fc-timeGridWeek-view.fc-view.fc-timegrid',
    ) as HTMLDivElement;
    html2canvas(elm).then((canvas) => {
      // Get the data URL for the image
      const dataURL = canvas.toDataURL('image/png');

      // Create a temporary download link
      const downloadLink = document.createElement('a');
      downloadLink.href = dataURL;
      downloadLink.download = 'capture.png';
      downloadLink.click();
    });
  }

  return (
    <Menu
      shadow="md"
      width={200}
      closeOnItemClick={false}
      closeOnClickOutside={true}
    >
      <Menu.Target>
        {/* <Button>Toggle menu</Button> */}
        {children}
      </Menu.Target>

      <Menu.Dropdown>
        <div>
          <Menu.Label>Plan Options</Menu.Label>

          <Popover
            withinPortal={false}
            trapFocus
            key="edit"
            width={200}
            position="left-start"
            withArrow
          >
            <Popover.Target>
              <Menu.Item leftSection={<Icon>edit</Icon>}>Edit</Menu.Item>
            </Popover.Target>
            <Popover.Dropdown>
              <TextInput
                placeholder="Plan Name"
                label="Plan Name"
                value={plan_store?.getPlan(uuid)?.name ?? ''}
                onChange={(e) => {
                  const plan = plan_store.getPlan(uuid);
                  if (plan) {
                    plan.name = e.currentTarget.value;
                    plan_store.updatePlan(plan, uuid);
                  }
                }}
              />
              <Textarea
                placeholder="Plan Description"
                label="Plan Description"
                value={plan_store?.getPlan(uuid)?.description ?? ''}
                onChange={(e) => {
                  const plan = plan_store.getPlan(uuid);
                  if (plan) {
                    plan.description = e.currentTarget.value;
                    plan_store.updatePlan(plan, uuid);
                  }
                }}
              />
            </Popover.Dropdown>
          </Popover>

          <Popover
            withinPortal={false}
            trapFocus
            key="share"
            width={200}
            position="left-start"
            withArrow
          >
            <Popover.Target>
              <Menu.Item leftSection={<Icon>share</Icon>}>Share</Menu.Item>
            </Popover.Target>
            <Popover.Dropdown>
              <Button onClick={jsonSave}>Save as JSON</Button>
              <Button onClick={imageSave}>Save as Image</Button>
            </Popover.Dropdown>
          </Popover>

          <Menu.Item
            key="delete"
            leftSection={<Icon>delete</Icon>}
            onClick={() => plan_store.removePlan(uuid)}
            color="red"
          >
            Delete
          </Menu.Item>
        </div>
      </Menu.Dropdown>
    </Menu>
  );
};

export default PlanMenu;
