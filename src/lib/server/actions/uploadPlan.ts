"use server";

import { Plan } from "@/lib/client/planStore";

export async function uploadPlan(currentPlanUUID: string, currentPlan: Plan | undefined, token: string) {
    const baseURL = `${process.env.SBCORE_URL}`;

    if (currentPlanUUID) {
        let planExists = false;
        await fetch(`${baseURL}/userPlans/${currentPlanUUID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
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
            await fetch(`${baseURL}/userPlans/${currentPlanUUID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(currentPlan),
            });
        } else {
            if (currentPlan && JSON.stringify(currentPlan) !== "{}") {
                await fetch(`${baseURL}/userPlans/${currentPlanUUID}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
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
