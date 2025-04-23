import { getTerms } from "@/lib/server/actions/getTerms";
import {
  Button,
  Center,
  NativeSelect,
  Popover,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { uuidv4 } from "@/lib/uuidv4";
import { planStore } from "@/lib/client/planStore";
import { prettyTermText } from "@/lib/client/prettyTermText";

const ValidatePlanName = (name: string): boolean => {
  const regexName = /^[a-zA-Z0-9-_\s]{1,20}$/;
  return regexName.test(name);
} 

const NewPlanButton = () => {
  const [terms, setTerms] = React.useState<{ value: string; label: string }[]>(
    []
  );
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm({
    mode: "uncontrolled",

    validateInputOnBlur: true,
    initialValues: {
      "Plan Name": "",
      "Plan Term": "",
      "Plan Description": "",
    },

    validate: {
      "Plan Name": (value) =>
        ValidatePlanName(value)
          ? null
          : "Must be 1–20 characters. Letters, numbers, spaces, hyphens, and underscores only.",
      "Plan Term": (value) => (value ? null : "Please select a term"),
    },
  });
  useEffect(()=>{
  if (terms.length === 0) {
    setTimeout(() => {
      //set timeout of 0 to delay the loading of terms until the callstack is empty
      getTerms().then((terms_val) => {
        for (let i = 0; i < terms_val.length; i++) {
          terms_val[i] = {
            value: terms_val[i],
            label: prettyTermText(terms_val[i], 2),
          };
        }
        setTerms(terms_val);
        form.setInitialValues({
          "Plan Name": "",
          "Plan Term": terms_val[0],
          "Plan Description": "",
        });
        form.setValues({
          "Plan Term": terms_val[0].value,
        });
      });
    }, 0);
  }
})
  const plan_store = planStore();

  function addPlan(form_values: {
    "Plan Name": string;
    "Plan Term": string;
    "Plan Description": string;
  }) {
    plan_store.addPlan({
      uuid: uuidv4(),
      name: form_values["Plan Name"],
      description: form_values["Plan Description"],
      term: parseInt(form_values["Plan Term"]),
      selected: false,
      courses: [],
      events: [],
      organizerSettings: {  isCommuter: false,
        commuteTimeHours: 0,
        compactPlan: false,
        courseFilters: []}
    });
  }
  return (
    <Popover
      opened={popoverOpen}
      onChange={setPopoverOpen}
      width={300}
      position="bottom"
      withArrow
      shadow="md"
      closeOnClickOutside={false}
    >
      <Popover.Target>
        <Button onClick={() => setPopoverOpen(!popoverOpen)}>New Plan</Button>
      </Popover.Target>
      <Popover.Dropdown bg="var(--mantine-color-body)">
        <Center>
          <Title order={3}>Create New Plan</Title>
        </Center>
        <form
          onSubmit={form.onSubmit((values) => {
            addPlan(values);
            form.reset();
            setPopoverOpen(false);
            form.setValues({
              "Plan Term": terms[0].value,
            });
          })}
          className="flex flex-col gap-4 p-4"
        >
          <TextInput
            key={form.key("Plan Name")}
            {...form.getInputProps("Plan Name")}
            label="Plan Name"
            placeholder="Enter Plan Name"
            required
          />
          <NativeSelect
            label="Plan Term"
            data={terms}
            required
            key={form.key("Plan Term")}
            {...form.getInputProps("Plan Term")}
          />
          <Textarea
            label="Plan Description"
            placeholder="Enter Plan Description"
            key={form.key("Plan Description")}
            {...form.getInputProps("Plan Description")}
          />
          <Button type="submit">Create</Button>
        </form>
      </Popover.Dropdown>
    </Popover>
  );
};

export default NewPlanButton;
