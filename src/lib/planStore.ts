import { create } from "zustand";
import { persist } from "zustand/middleware";
/*
plan object

[
{
uuid:crypto.randomUUID() //auto generated at creation
name:"Plan Name",
description:"Plan Description",
term:202490
courses:[

]
}]

course object
{
title:"Course Title",
code: "CS 100",
description:"Course Description",
prerequisites: ["CS 101","CS 102"],
credits: 3,
sections:[
]
}

section object
{
meetingTimes:[
{
day:"M",
startTime:"1900-01-01T14:30:00.000Z"
endTime:"1900-01-01T15:45:00.000Z"
building:"Building Name",
room:"Room Number"
}
]
instructor:"Instructor Name",
seats:30,
currentEnrollment:30,
status:"Open"
is_honors:true
is_async:true
}

*/

type Plan = {
  uuid: string;
  name: string;
  description: string;
  term: number;
  courses?: Course[];
};

type Course = {
  title: string;
  code: string;
  description: string;
  prerequisites: string[];
  credits: number;
  sections: Section[];
};

type Section = {
  meetingTimes: MeetingTime[];
  instructor: string;
  seats: number;
  currentEnrollment: number;
  status: string;
  is_honors: boolean;
  is_async: boolean;
};
type MeetingTime = {
  day: string;
  startTime: string;
  endTime: string;
  building: string;
  room: string;
};

interface PlanStoreState {
  plans: Plan[];
  setPlans: (plans: Plan[]) => void;
  addPlan: (newPlan: Plan) => void;
  updatePlan: (updatedPlan: Plan, uuid: string) => void;
  removePlan: (uuid: string) => void;
  getPlan: (uuid: string) => Plan | undefined;
}

export const planStore = create<PlanStoreState>()(
  persist(
    (set, get) => ({
      plans: [],
      setPlans: (plans) => set({ plans }),
      addPlan: (newPlan) => {
        const { plans } = get();
        set({ plans: [...plans, newPlan] });
      },
      updatePlan: (updatedPlan, uuid) => {
        const { plans } = get();
        set({
          plans: plans.map((plan) => (plan.uuid === uuid ? updatedPlan : plan)),
        });
      },
      removePlan: (uuid) => {
        const { plans } = get();
        set({ plans: plans.filter((plan) => plan.uuid !== uuid) });
      },
      getPlan: (uuid) => {
        const { plans } = get();
        return plans.find((plan) => plan.uuid === uuid);
      },
    }),
    {
      name: "plan-store",
    }
  )
);
