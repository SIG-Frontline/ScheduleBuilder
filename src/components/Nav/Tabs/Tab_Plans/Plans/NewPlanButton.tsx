import { getTerms } from "@/lib/server/actions/getTerms";
import {
  Button,
  Center,
  Popover,
  Select,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { uuidv4 } from "@/lib/uuidv4";
import { planStore } from "@/lib/client/planStore";
import { prettyTermText } from "@/lib/client/prettyTermText";
const NewPlanButton = () => {
  const [terms, setTerms] = React.useState<{ value: string; label: string }[]>(
    []
  );
  const [popoveOpen, setPopoverOpen] = useState(false);
  useEffect(() => {
    getTerms().then((terms_val) => {
      for (let i = 0; i < terms_val.length; i++) {
        terms_val[i] = {
          value: terms_val[i],
          label: prettyTermText(terms_val[i], 2),
        };
      }
      setTerms(terms_val);
    });
  }, []);
  const form = useForm({
    mode: "uncontrolled",

    validateInputOnBlur: true,
    initialValues: { "Plan Name": "", "Plan Term": "", "Plan Description": "" },

    validate: {
      "Plan Name": (value) =>
        value.length > 3
          ? null
          : "Plan name must be at least 4 characters long",
      "Plan Term": (value) => (value ? null : "Please select a term"),
    },
  });
  const plan_store = planStore();

  function addPlan(form_values: {
    "Plan Name": string;
    "Plan Term": string;
    "Plan Description": string;
  }) {
    console.log(form_values);
    plan_store.addPlan({
      uuid: uuidv4(),
      name: form_values["Plan Name"],
      description: form_values["Plan Description"],
      term: parseInt(form_values["Plan Term"]),
      selected: false,
      courses: [],
      events: [],
    });
  }
  return (
    <Popover
      opened={popoveOpen}
      onChange={setPopoverOpen}
      width={300}
      position="bottom"
      withArrow
      shadow="md"
      closeOnClickOutside={false}
    >
      <Popover.Target>
        <Button onClick={() => setPopoverOpen(!popoveOpen)}>New Plan</Button>
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
          <Select
            label="Plan Term"
            placeholder="Select Term"
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
