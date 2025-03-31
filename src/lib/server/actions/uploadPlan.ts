"use server";

import { Plan } from "@/lib/client/planStore";

export async function uploadPlan(currentPlanUUID: string, currentPlan: Plan | undefined, userId: string) {
  const baseURL = `${process.env.SBCORE_URL}`;
  if (currentPlanUUID) {
    let planExists = false;
    await fetch(`${baseURL}/userPlans/${userId}/${currentPlanUUID}`, {
      method: "GET",
    })
      .then((res) => {
        if (res.status === 404) {
          console.log("Plan does not exist yet");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          planExists = true;
        }
      });
    if (planExists) {
      await fetch(`${baseURL}/userPlans/${userId}/${currentPlanUUID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentPlan),
      });
    } else {
      if (currentPlan && JSON.stringify(currentPlan) !== "{}") {
        await fetch(`${baseURL}/userPlans/${userId}/${currentPlanUUID}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentPlan),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Plan Added:", data);
          });
      }
    }
  }
}
