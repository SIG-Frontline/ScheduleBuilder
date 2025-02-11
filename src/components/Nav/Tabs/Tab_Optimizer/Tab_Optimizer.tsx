import React, { useState } from "react";
import { Button, Text, TextInput, Checkbox, Group } from "@mantine/core";
import { filterStore } from "@/lib/client/filterStore";
import { planStore } from "@/lib/client/planStore";

import { optimizePlan } from "@/lib/server/optimizer";

const Tab_Optimiser = () => {
  const [input, setInput] = useState({
    text: "",
	 isCommuter: false,
  });

  const filter_store = filterStore();
  const plan_store = planStore();

  // Creates the new plan based on the term of the currently selected plan
  const selectedPlanuuid = plan_store.currentSelectedPlan;
  const selectedPlan = plan_store.plans.find(
    (plan) => plan.uuid === selectedPlanuuid
  );

  async function optimizeClasses() {
	  // Sanitizes the temp input
	  const classes = []

	  const classesList = input.text.split(",");
	  for(const c of classesList) {
		  classes.push(c.trim());
	  }

	  return await optimizePlan(classes, filter_store.filters, selectedPlan?.term ?? 202490, input.isCommuter);
  }

  return (
    <>
      <Text size="md" ta={"center"}>
		 Temporary Optimizer UI
      </Text>
	  <div className="flex flex-col mx-6 gap-3"> 
			<TextInput
				label="Classes to Optimize"
				description="A comma separated list of classes in the form XXX 123"
				placeholder="CS 100, CS 280"
				onChange={(e) =>
				  setInput({ ...input, text: e.currentTarget.value })
				}
			/>
        <Checkbox.Card
          p={"sm"}
          radius="md"
			 checked={input.isCommuter}
			 onChange={(checked) =>
				setInput({ ...input, isCommuter: checked, })
			 }
        >
          <Group wrap="nowrap" align="flex-start">
            <Checkbox.Indicator />
            <div>
              <Text fw={500}>Commuter</Text>
              <Text size="xs" c="dimmed">
				  	Bias the optimizer towards commuter schedules by including commute times
              </Text>
            </div>
          </Group>
        </Checkbox.Card>
		  <Button variant="filled" onClick={async () => {
			const bestPlan = await optimizeClasses()

			if(!bestPlan) {
				console.error("No plan found");
				return;
			}

			// HACK: add it to the plans store
			const addPlan = plan_store.addPlan;
			addPlan(bestPlan);

		  }}>
			 Find Best Schedule
		  </Button>
		  <Text ta={"center"}>
			 Input a list of classes separated by commas, then press the button. This will create a new plan (with the same term as the currently selected plan, or defaults to F' 2024)
		  </Text>
		  <Text ta={"center"}>
		  	It does take a second for it to load, and it will error (currently) if it cannot find a schedule.
		  </Text>
	  </div>
    </>
  );
};

export default Tab_Optimiser;
