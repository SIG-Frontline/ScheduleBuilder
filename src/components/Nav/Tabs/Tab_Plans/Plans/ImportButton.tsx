import Icon from "@/components/Icon/Icon";
import { planStore } from "@/lib/client/planStore";
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
          plan.uuid = (() => {
            function uuidv4() {
              return "10000000-1000-4000-8000-100000000000".replace(
                /[018]/g,
                (c) =>
                  (
                    +c ^
                    (crypto.getRandomValues(new Uint8Array(1))[0] &
                      (15 >> (+c / 4)))
                  ).toString(16)
              );
            }
            return uuidv4();
          })();
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
