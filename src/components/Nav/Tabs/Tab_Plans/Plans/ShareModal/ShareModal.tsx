import { planStore } from "@/lib/client/planStore";
import { Button, Group, Modal } from "@mantine/core";
import html2canvas from "html2canvas";
import { notifications } from "@mantine/notifications";
export default function ShareModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const plan_store = planStore();
  const currentSelectedPlan = plan_store.currentSelectedPlan;
  const plans = plan_store.plans;
  const currentSelectedPlanObj = plan_store.getPlan(
    currentSelectedPlan ?? plans[0]?.uuid
  );
  function jsonSave() {
    const json = JSON.stringify(currentSelectedPlanObj);
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

  function copyShareableLink() {
    let urlInfo = new Map();
    const planName = currentSelectedPlanObj?.name ?? "SharedPlan";
    const term = currentSelectedPlanObj?.term;

    urlInfo.set("name", planName);
    urlInfo.set("term", term);

    currentSelectedPlanObj?.courses?.forEach((course, index) => {
      let hasSelectedSection = false;
      course.sections.forEach((section) => {
        if (section.selected) {
          // If the course has a specific section selected. Add that section's CRN and flag the course with "t"
          hasSelectedSection = true;
          urlInfo.set("crn" + index + "t", section.crn);
        }
      });
      if (!hasSelectedSection) {
        // If the course does NOT have a particular section selected. Grab the first section's CRN and flag the course with "f"
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

    const urlString: string = "localhost:3000/?" + queryString;
    // console.log(urlString);
    navigator.clipboard.writeText(urlString);
    notifications.show({
      title: "Share link has been copied to clipboard!",
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

  function csvSave() {
    if (!currentSelectedPlanObj) {
      notifications.show({
        title: "Error",
        message: "No plan selected to save as CSV.",
        color: "red",
        position: "top-right",
      });
      return;
    }

    let csvContent = `Plan Name,${currentSelectedPlanObj.name}\nTerm,${currentSelectedPlanObj.term}\n\n`;
    csvContent += `Code,Title,Instructor,CRN,Day,Start Time,End Time,Building,Room\n`;
    currentSelectedPlanObj?.courses?.forEach((course) => {
      /* 
      THE FORMAT OF THE CSV FILE IS:
      CODE | TITLE | INSTRUCTOR | CRN | DAY | START TIME | END TIME | BUILDING | ROOM 
      */
      let courseCsvContent = `"${course.code}","${course.title}",`;
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
    const filename = sanitizeFilename(currentSelectedPlanObj.name);
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    notifications.show({
      title: "CSV Saved",
      message: "The CSV file has been downloaded.",
      color: "green",
      position: "top-right",
    });
  }

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="Share & Export">
        <Group>
          <Button variant="filled" onClick={jsonSave}>
            Save as JSON
          </Button>
          <br />
          <br />
          <Button variant="filled" onClick={imageSave}>
            Save as Image
          </Button>
          <Button variant="filled" onClick={csvSave}>
            Save as CSV
          </Button>
          <Button variant="filled" onClick={copyShareableLink}>
            Copy Link
          </Button>
        </Group>
      </Modal>
    </>
  );
}
