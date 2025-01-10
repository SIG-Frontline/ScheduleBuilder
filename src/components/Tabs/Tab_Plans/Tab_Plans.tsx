import {
  Button,
  Group,
  Modal,
  Select,
  TextInput,
  FileButton,
  Text,
  Tooltip,
} from "@mantine/core";
import Plans, { humanReadableTerm } from "./Plans/Plans";
import Icon from "@/components/Icon/Icon";
import { planStore } from "@/lib/planStore";
import { useDisclosure } from "@mantine/hooks";
import { getTerms } from "@/actions/getTerms";
import { useEffect, useState } from "react";

const Tab_Plans = () => {
  // const addPlan = planStore((state) => state.addPlan);
  const [terms, setTerms] = useState<string[]>([]);
  const plan_store = planStore();
  const addPlan = plan_store.addPlan;
  const [modalopened, { open, close }] = useDisclosure(false);
  const [selectedTerm, setSelectedTerm] = useState<string>(terms[0]);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");
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

          addPlan(plan);
        }
      };
      reader.readAsText(files);
      setFiles(null);
    }
  }, [files, addPlan]);
  return (
    <>
      <Group justify="center" py={"14px"}>
        <Modal opened={modalopened} onClose={close} title="New Plan">
          <TextInput
            label="Name"
            placeholder="Enter Plan Name"
            value={selectedPlanName}
            onChange={(e) => setSelectedPlanName(e.currentTarget.value)}
          />
          <Select
            label="Term"
            placeholder="Select Term"
            data={terms}
            value={selectedTerm}
            onChange={(val) => setSelectedTerm(val ?? terms[0])}
          />
          <Button
            mt={"10px"}
            onClick={() => {
              //validate the input
              if (
                selectedPlanName === undefined ||
                selectedPlanName.length === 0
              ) {
                alert("Please enter a name for the plan");
                return;
              }
              if (selectedTerm === undefined || selectedTerm.length === 0) {
                alert("Please select a term for the plan");
                return;
              }

              addPlan({
                uuid: (() => {
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
                })(),
                name: selectedPlanName,
                description: "this is a plan",
                term: parseInt(selectedTerm),
                selected: false,
                courses: [],
              });
              setSelectedPlanName("");
              setSelectedTerm(terms[0]);
              close();
            }}
          >
            Create
          </Button>
        </Modal>
        <Tooltip label="Create a new plan">
          <Button
            onClick={() => {
              open();
              getTerms().then((terms_val) => {
                for (let i = 0; i < terms_val.length; i++) {
                  terms_val[i] = {
                    value: terms_val[i],
                    label: humanReadableTerm(terms_val[i]),
                  };
                }
                setTerms(terms_val);
              });
            }}
            leftSection={<Icon>add</Icon>}
          >
            New Plan
          </Button>
        </Tooltip>
        <Tooltip label="Import a plan from a JSON file">
          <div>
            <FileButton onChange={setFiles} accept="application/json">
              {(props) => (
                <Button {...props} leftSection={<Icon>upload</Icon>}>
                  Import Plan
                </Button>
              )}
            </FileButton>
          </div>
        </Tooltip>
      </Group>
      {plan_store.plans.length === 0 ? (
        <>
          <Text className="text-center !mt-8" c="dimmed" size="xl">
            <Icon className="!text-4xl">info</Icon>
          </Text>
          <Text className="text-center !mx-10 " c="dimmed">
            No plans have been added yet, click the button above to create a new
            plan.
          </Text>
        </>
      ) : (
        <Plans />
      )}
    </>
  );
};

export default Tab_Plans;
