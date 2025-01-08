import { Button, Group, Modal, Select, TextInput } from "@mantine/core";
import Plans, { humanReadableTerm } from "./Plans/Plans";
import Icon from "@/components/Icon/Icon";
import { planStore } from "@/lib/planStore";
import { useDisclosure } from "@mantine/hooks";
import { getTerms } from "@/actions/getTerms";
import { useState } from "react";

const Tab_Plans = () => {
  // const addPlan = planStore((state) => state.addPlan);
  const [terms, setTerms] = useState<string[]>([]);
  const plan_store = planStore();
  const addPlan = plan_store.addPlan;
  const [modalopened, { open, close }] = useDisclosure(false);
  const [selectedTerm, setSelectedTerm] = useState<string>(terms[0]);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");
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
            onChange={(val) => setSelectedTerm(val)}
          />
          <Button
            mt={"10px"}
            onClick={() => {
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
              close();
            }}
          >
            Create
          </Button>
        </Modal>
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

            // addPlan({
            //   uuid: (() => {
            //     function uuidv4() {
            //       return "10000000-1000-4000-8000-100000000000".replace(
            //         /[018]/g,
            //         (c) =>
            //           (
            //             +c ^
            //             (crypto.getRandomValues(new Uint8Array(1))[0] &
            //               (15 >> (+c / 4)))
            //           ).toString(16)
            //       );
            //     }
            //     return uuidv4();
            //   })(),
            //   name: "my awesome plan" + Math.floor(Math.random() * 100),
            //   description: "this is a plan",
            //   term: 202490,
            //   selected: false,
            //   courses: [],
            // });
          }}
          leftSection={<Icon>add</Icon>}
        >
          New Plan
        </Button>
        <Button leftSection={<Icon>upload</Icon>}>Import Plan</Button>
      </Group>
      <Plans />
    </>
  );
};

export default Tab_Plans;
