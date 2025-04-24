import Icon from "@/components/Icon/Icon";
import { planStore } from "@/lib/client/planStore";
import { getSectionDataByCrn } from "@/lib/server/actions/getSectionDataByCrn";
import {
  Button,
  Menu,
  Popover,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import html2canvas from "html2canvas";
import React from "react";

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
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function imageSave() {
    const elm: HTMLDivElement = document.querySelector(
      ".fc-timeGridWeek-view.fc-view.fc-timegrid"
    ) as HTMLDivElement;
    html2canvas(elm).then((canvas) => {
      // Get the data URL for the image
      const dataURL = canvas.toDataURL("image/png");

      // Create a temporary download link
      const downloadLink = document.createElement("a");
      downloadLink.href = dataURL;
      downloadLink.download = "capture.png";
      downloadLink.click();
    });
  }
  function urlSave() {
    let urlInfo = new Map();
    const planName = plan_store.getPlan(uuid)?.name;
    const term = plan_store.getPlan(uuid)?.term;

    urlInfo.set("name", planName);
    urlInfo.set("term", term);

    plan_store.getPlan(uuid)?.courses?.forEach((course, index) => {
      let hasSelectedSection = false;
      course.sections.forEach((section) => {
        if (section.selected) {
          hasSelectedSection = true;
          urlInfo.set("crn" + index + "t", section.crn);
        }
      });
      if (!hasSelectedSection) {
        urlInfo.set("crn" + index + "f", course.sections[0].crn);
      }
    });
    // console.log(urlInfo);
    const queryString = Array.from(urlInfo)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    // console.log(queryString);
    getSectionDataByCrn(queryString);
    const urlString: string = "localhost:3000/?" + queryString;
    // console.log(urlString);
    navigator.clipboard.writeText(urlString);
    notifications.show({
      title: "Share link has been copied to clipboard!",
      message: "You can now share this link with others.",
      color: "green",
      icon: <Icon>check</Icon>,
      autoClose: 5000,
      radius: "md",
      position: "top-right",
    });
  }

  function sanitizeFilename(filename: string): string {
    // Regular expression to match characters to be removed or replaced.
    const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F\x80-\xFF]+/g;

    // Replace invalid characters with an underscore or another safe character.
    const sanitizedFilename = filename.replace(invalidCharsRegex, "_");

    // Remove leading/trailing spaces and dots.
    const trimmedFilename = sanitizedFilename.trim().replace(/^\.+|\.+$/g, "");

    // Limit the length to a reasonable maximum (e.g., 255 characters).
    const maxLength = 255; // Common file system limit
    const truncatedFilename = trimmedFilename.substring(0, maxLength);

    return truncatedFilename;
  }

  function textSave() {
    const currentPlan = plan_store.getPlan(uuid);
    const planName = currentPlan?.name;
    const term = currentPlan?.term;
    if (!planName || !currentPlan || !term) {
      notifications.show({
        title: "Error",
        message: "No plan selected to save as CSV.",
        color: "red",
        position: "top-right",
      });
      return;
    }
    let textContent = `Plan Name: ${planName}\nTerm: ${term?.toString()}\n\nCourses:\n\n`;

    currentPlan.courses?.forEach((course) => {
      console.log(course);
      let courseTextContent = `${course.code}: ${course.title}\nCredit Hours: ${course.credits}\n\nDescription: \n ${course.description}\n\n`;
      let hasSelectedSection = false;
      course.sections.forEach((section) => {
        if (section.selected) {
          hasSelectedSection = true;
          courseTextContent += `Section/CRN: ${section.crn}\nInstructor: ${section.instructor}\n`;

          // If the length of the meetingTimes array is 0, course does not meet (online).
          textContent += courseTextContent + `Meeting Times & Locations:\n`;
          if (section.meetingTimes.length == 0) {
            textContent += `No Time/Location Info for this course.\nLikely online only\n`;
          } else {
            console.log(section.meetingTimes);
            section.meetingTimes.forEach((meetTime) => {
              textContent += `Day: ${meetTime.day} Start Time: ${new Date(
                meetTime.startTime
              )
                .toISOString()
                .split("T")[1]
                .split(".")[0]
                .substring(0, 5)} End Time: ${new Date(meetTime.endTime)
                .toISOString()
                .split("T")[1]
                .split(".")[0]
                .substring(0, 5)} Building: ${meetTime.building} Room: ${
                meetTime.room
              }\n`;
            });
          }
        }
      });
      if (!hasSelectedSection) {
        textContent +=
          courseTextContent + `No section selected for this course\n`;
      }
      textContent += `\n=======================================================================\n\n`;
    });
    const blob = new Blob([textContent], { type: "text/txt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = sanitizeFilename(planName);
    a.download = `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    notifications.show({
      title: "Text File Saved",
      message: "The text file has been downloaded.",
      position: "top-right",
    });
  }

  function csvSave() {
    const currentPlan = plan_store.getPlan(uuid);
    const planName = currentPlan?.name;
    const term = currentPlan?.term;
    if (!planName || !currentPlan || !term) {
      notifications.show({
        title: "Error",
        message: "No plan selected to save as CSV.",
        color: "red",
        position: "top-right",
      });
      return;
    }

    let csvContent = `Plan Name,${
      currentPlan.name
    }\nTerm,${term.toString()}\n\n`;
    csvContent += `Code,Title,Instructor,CRN,Day,Start Time,End Time,Building,Room\n`;
    currentPlan.courses?.forEach((course) => {
      /* 
      THE FORMAT OF THE CSV FILE IS:
      CODE | TITLE | INSTRUCTOR | CRN | DAY | START TIME | END TIME | BUILDING | ROOM 
      */
      let courseCsvContent = `"${course.credits}","${course.code}","${course.title}",`;
      let hasSelectedSection = false;
      course.sections.forEach((section) => {
        if (section.selected) {
          hasSelectedSection = true;
          courseCsvContent += `"${section.instructor}","${section.crn}",`;
          // If the length of the meetingTimes array is 0, course does not meet (online).
          if (section.meetingTimes.length == 0) {
            csvContent += courseCsvContent + `No Time/Location Info\n`;
          } else {
            section.meetingTimes.forEach((meetTime) => {
              csvContent +=
                courseCsvContent +
                `"${meetTime.day}","${
                  new Date(meetTime.startTime)
                    .toISOString()
                    .split("T")[1]
                    .split(".")[0]
                }","${
                  new Date(meetTime.endTime)
                    .toISOString()
                    .split("T")[1]
                    .split(".")[0]
                }","${meetTime.building}","${meetTime.room}"\n`;
            });
          }
        }
      });
      if (!hasSelectedSection) {
        csvContent += courseCsvContent + `No Section Selected\n`;
      }
    });
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = sanitizeFilename(planName);
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    notifications.show({
      title: "CSV Saved",
      message: "The CSV file has been downloaded.",
      position: "top-right",
    });
  }

  return (
    <Menu
      shadow="md"
      width={200}
      closeOnItemClick={false}
      closeOnClickOutside={false}
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
                value={plan_store?.getPlan(uuid)?.name ?? ""}
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
                value={plan_store?.getPlan(uuid)?.description ?? ""}
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
              <Stack gap="xs" w="80%" mx="auto">
                <Button fullWidth onClick={jsonSave}>
                  Save as JSON
                </Button>
                <Button fullWidth onClick={imageSave}>
                  Save as Image
                </Button>
                <Button fullWidth onClick={urlSave}>
                  Save as URL
                </Button>
                <Button fullWidth onClick={textSave}>
                  Save as TXT
                </Button>
                <Button fullWidth onClick={csvSave}>
                  Save as CSV
                </Button>
              </Stack>
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
