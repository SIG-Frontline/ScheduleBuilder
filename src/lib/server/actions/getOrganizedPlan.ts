"use server";

import { Plan } from "@/lib/client/planStore";

/**
 * Accepts a plan to organize. It will then return a plan which is scored to be the "most optimal"
 *
 * @param currentPlan The currently selected plan to organize
 * @returns A Plan object with the most optimal schedule generated based on the 'rateSections' function, undefined if none can be generated with the given inputs
 */
export async function organizePlan(
  currentPlan: Plan
): Promise<Plan | { error: string }> {
  if (!currentPlan)
    return {
      error: "No plan provided!",
    };

  console.log(`${currentPlan.uuid} organizer settings: ${currentPlan.organizerSettings}`);

  const baseURL = `${process.env.SBCORE_URL}`;
  const URL = `${baseURL}/organizer`;

  console.log(URL);

  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentPlan),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || "An error has occured" };
    }
    return await res.json();
  } catch (error) {
    console.error("Request failed:", error);
    return { error: "A network or server error has occured" };
  }
}
