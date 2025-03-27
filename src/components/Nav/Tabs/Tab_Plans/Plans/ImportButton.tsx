import Icon from "@/components/Icon/Icon";
import { planStore } from "@/lib/client/planStore";
import { uuidv4 } from "@/lib/uuidv4";
import { Button, FileButton } from "@mantine/core";
import React, { useEffect, useState } from "react";

const ImportButton = () => {
  const plan_store = planStore();
  const addPlan = plan_store.addPlan;
  const [files, setFiles] = useState<File | null>(null);

  useEffect(() => {
    //if there are files, add them to the plan store, then set the files to null
    //make sure the plan is not selected
    if (files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result;
        if (contents) {
          const plan = JSON.parse(contents as string);
          plan.selected = false;
          plan.uuid = uuidv4();
          //validate the plan
          const plan_keys = ["name", "description", "term", "courses"];
          for (const key of plan_keys) {
            if (!(key in plan)) {
              alert("The plan is missing the key: " + key);
              return;
            }
          }
          //validate the term
          if (typeof plan.term !== "number") {
            alert("The term must be a number");
            return;
          }
          addPlan(plan);
        }
      };
      reader.readAsText(files);
      setFiles(null);
    }
  }, [files, addPlan]);

  return (
    <FileButton onChange={setFiles} accept="application/json">
      {(props) => (
        <Button {...props} leftSection={<Icon>upload</Icon>}>
          Import Plan
        </Button>
      )}
    </FileButton>
  );
};

export default ImportButton;
