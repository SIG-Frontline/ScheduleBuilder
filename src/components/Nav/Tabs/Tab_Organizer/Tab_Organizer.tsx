import React, { useState } from "react";
import { Button, Text, TextInput, Checkbox, Group } from "@mantine/core";
import { planStore, organizerSettings } from "@/lib/client/planStore";

import { organizePlan } from "@/lib/server/organizer";
import { getRecommendedClasses } from "@/lib/server/recommender";

const Tab_Optimiser = () => {
  const [input, setInput] = useState({
	 isCommuter: false,
	 commuteTime: "",
	 condenseSchedules: false,
	 error: "",
  });

  const plan_store = planStore();

  // Creates the new plan based on the term of the currently selected plan
  const selectedPlanuuid = plan_store.currentSelectedPlan;
  const selectedPlan = plan_store.plans.find(
    (plan) => plan.uuid === selectedPlanuuid
  );

  async function organizeClasses() {
	  // Sanitizes the temp input
	  const commuteTime = isNaN(parseInt(input.commuteTime)) ? 2 : parseInt(input.commuteTime);
	  const settings = {
			isCommuter: input.isCommuter,
			commuteTimeHours: commuteTime,
			compactPlan: input.condenseSchedules,
			courseFilters: [],
	  } as organizerSettings;

	  if(!selectedPlan) return;

	  // HACK: inject settings into the plan 
	  
	  // Saves the course filters if they are already stored (mostly for the tests, this will be changed with the new UI)
	  if(selectedPlan.organizerSettings && selectedPlan.organizerSettings.courseFilters) settings.courseFilters = selectedPlan.organizerSettings.courseFilters
	  selectedPlan.organizerSettings = settings;

	  return await organizePlan(selectedPlan);
  }

  async function getRecommendations() {
	  // Test parameters
	  console.log(await getRecommendedClasses("BS", "CS", "2025", ["MATH 111", "PHYS 111", "PHYS 111A", "CS 113", "PHYS 121", "PHYS 121A", "MATH 112", "R087 121", "ENGL 101", "FYS SEM", "CHEM 121", "CS 100", "EPS 202", "MATH 333", "IS 247", "ENGL 102", "CS 114", "IT 120", "PHYS 202", "CS 280", "CS 241", "IS 350", "CS 331", "PYS 210", "YWCC 207", "CS 288", "CS 301", "CS 332", "CS 356", "COM 313" ]));
  }

  return (
    <>
      <Text size="md" ta={"center"}>
		 Temporary Organizer UI
      </Text>
	  <div className="flex flex-col mx-6 gap-3"> 
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
				  	Bias the organizer towards commuter schedules by including commute times
              </Text>
            </div>
          </Group>
        </Checkbox.Card>
		 {input.isCommuter && <Group wrap="nowrap" align="flex-start">
			<TextInput
				label="Commute Hours"
				description="The numbers of hours spent commuting per day"
				placeholder="2"
				onChange={(e) =>
				  setInput({ ...input, commuteTime: e.currentTarget.value })
				}
			/>
		 </Group>
		 }
        <Checkbox.Card
          p={"sm"}
          radius="md"
			 checked={input.condenseSchedules}
			 onChange={(checked) => {
				   setInput({ ...input, condenseSchedules: checked, })
				}
			 }
        >
			 <Group wrap="nowrap" align="flex-start">
			   <Checkbox.Indicator />
			   <div>
				 <Text fw={500}>Compact</Text>
				 <Text size="xs" c="dimmed">
						Bias the organized towards schedules with classes one after another
				 </Text>
				 <Text size="xs" c="red">
						WARNING: It is not recommended to have too many classes back-to-back, a break is recommended in between
				 </Text>
			   </div>
			 </Group>
		   </Checkbox.Card>
		  <Button variant="filled" onClick={async () => {
			const bestPlan = await organizeClasses()

			if(!bestPlan) {
				setInput({ ...input, error: "No plan could be generated!" })
				return;
			}

			// HACK: don't save the organizer settings to the database as things are changing a lot
			delete bestPlan.organizerSettings;

			// Update the current plan to the generated one
			// TODO: maybe ask the user if they want to create a new one to not override the current plan? 
			const updatePlan = plan_store.updatePlan;
			updatePlan(bestPlan, bestPlan.uuid);

		  }}>
			 Find Best Schedule
		  </Button>
		  <Text ta={"center"}>
				This will optimize the currently selected plan with the settings above to have the least amount of time on campus. Plans with more courses will take longer to complete.  
		  </Text>
		  <Text ta={"center"} color="red">
		  	{ input.error }	
		  </Text>
		  <Button variant="filled" onClick={async () => {
			  getRecommendations();
		  }}>
		  	Get Recommendations
		  </Button>
	  </div>
    </>
  );
};

export default Tab_Optimiser;
