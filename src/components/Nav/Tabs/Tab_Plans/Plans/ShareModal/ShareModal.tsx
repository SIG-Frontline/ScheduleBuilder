import { planStore } from "@/lib/client/planStore";
import { Button, Group, Modal } from "@mantine/core";
import html2canvas from "html2canvas";
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

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="Share & Export">
        {/* Modal content */}
        <Group>
          <Button variant="filled" onClick={jsonSave}>
            Save as JSON
          </Button>
          <br />
          <br />
          <Button variant="filled" onClick={imageSave}>
            Save as Image
          </Button>
          <Button variant="filled">[not working] Save as ICS</Button>
          <Button variant="filled">[not working] Copy Link</Button>
        </Group>
      </Modal>
    </>
  );
}
