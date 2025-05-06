import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uploadPlan } from "../server/actions/uploadPlan";
import { getPlans } from "../server/actions/getPlans";
import { deletePlan } from "../server/actions/deletePlan";
import { getAccessToken } from "@auth0/nextjs-auth0";

function debounce(callback: () => void, delay: number) {
  let timeout: NodeJS.Timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  };
}

export type Plan = {
  uuid: string;
  name: string;
  description: string;
  term: number;
  courses?: Course[];
  events?: Event[];
  selected: boolean;
  isTemporary?: boolean;
  organizerSettings?: organizerSettings;
};

export type Course = {
  title: string;
  code: string;
  description: string;
  prerequisites: string[];
  credits: number;
  sections: Section[];
  color?: string;
};

export type Section = {
  meetingTimes: MeetingTime[];
  instructor: string;
  crn: string;
  currentEnrollment: number;
  maxEnrollment: number;
  status: string;
  is_honors: boolean;
  is_async: boolean;
  instruction_type: string;
  sectionNumber: string;
  comments: string;
  selected: boolean;
};
export type MeetingTime = {
  day: string;
  startTime: string;
  endTime: string;
  building: string;
  room: string;
};
export type Event = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  color?: string;
  maxSeats: number;
  currentSeats: number;
};
export interface organizerSettings {
  isCommuter: boolean;
  commuteTimeHours: number;
  compactPlan: boolean;
  courseFilters: courseFilter[];
}

export interface courseFilter {
  courseCode: string;
  instructor?: string;
  honors?: boolean;
  online?: instructionType;
  section?: string;
}
export enum instructionType {
  ONLINE = "online",
  HYBRID = "hybrid",
  INPERSON = "face-to-face",
  ANY = "any",
}

interface PlanStoreState {
  plans: Plan[];
  currentSelectedPlan: string | null;
  openCourseId: string | null;
  setPlans: (plans: Plan[]) => void;
  addPlan: (newPlan: Plan) => void;
  updatePlan: (updatedPlan: Plan, uuid: string) => void;
  removePlan: (uuid: string) => void;
  getPlan: (uuid: string) => Plan | undefined;
  selectPlan: (uuid: string) => void;
  addCourseToPlan: (course: Course) => void;
  selectSection: (course: string, crn: string) => void;
  deleteCourseFromPlan: (course: string) => void;
  addEventToPlan: (event: Event) => void;
  removeEventFromPlan: (event: Event) => void;
  updateCourseColor: (course: Course, color: string) => void;
  clearPlans: () => void;
  setOpenCourseId: (id: string | null) => void;
}

export const planStore = create<PlanStoreState>()(
  persist(
    (set, get) => ({
      plans: [],
      currentSelectedPlan: null,
      setPlans: (plans) => {
        set({
          plans: plans.map((plan) => ({
            ...plan,
            isTemporary: plan.isTemporary ?? false,
          })),
        });
      },
      addPlan: (newPlan) => {
        const { plans } = get();
        if (plans.length === 0) {
          newPlan.selected = true;
        }
        set({
          plans: [
            ...plans,
            { ...newPlan, isTemporary: newPlan.isTemporary ?? false },
          ],
          currentSelectedPlan: newPlan.uuid,
        });
      },
      selectPlan: (uuid) => {
        const { plans } = get();
        const newplans = plans.map((plan) => ({
          ...plan,
          selected: plan.uuid === uuid,
        }));
        localStorage.setItem("lastSelectedPlanUUID", uuid);
        set({
          plans: newplans,
          currentSelectedPlan: uuid,
        });
      },
      updatePlan: (updatedPlan, uuid) => {
        const { plans } = get();
        set({
          plans: plans.map((plan) => (plan.uuid === uuid ? updatedPlan : plan)),
        });
      },
      removePlan: async (uuid) => {
        const { plans, currentSelectedPlan } = get();
        let newSelectedPlan = currentSelectedPlan;
        if (currentSelectedPlan === uuid && plans.length > 1) {
          newSelectedPlan = plans[0].uuid;
        } else if (currentSelectedPlan === uuid && plans.length === 1) {
          newSelectedPlan = null;
        }
        set({
          plans: plans.filter((plan) => plan.uuid !== uuid),
          currentSelectedPlan: newSelectedPlan,
        });
        const user = await fetch("/auth/profile");
        if (!(user.status === 200)) {
          console.log("User is not authenticated");
          return;
        }

        deletePlan(await getAccessToken(), uuid);
      },
      getPlan: (uuid) => {
        const { plans } = get();
        return plans.find((plan) => plan.uuid === uuid);
      },
      addCourseToPlan: (course) => {
        const { plans, currentSelectedPlan } = get();
        const currentPlan = plans.find(
          (plan) => plan.uuid === currentSelectedPlan
        );
        const currentPlanHasCourse = currentPlan?.courses?.find(
          (c) => c.code === course.code
        );
        if (currentPlanHasCourse) {
          alert("Course already in plan");
          return;
        }
        set({
          plans: plans.map((plan) =>
            plan.uuid === currentSelectedPlan
              ? {
                  ...plan,
                  courses: plan.courses ? [course, ...plan.courses] : [course],
                }
              : plan
          ),
          openCourseId: course.code,
        });
      },
      selectSection: (course, crn) => {
        const { plans, currentSelectedPlan } = get();
        const newPlans = plans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                courses: plan.courses?.map((c) =>
                  c.code === course
                    ? {
                        ...c,
                        sections: c.sections.map((s) =>
                          s.crn === crn
                            ? { ...s, selected: true }
                            : { ...s, selected: false }
                        ),
                      }
                    : c
                ),
              }
            : plan
        );
        set({ plans: newPlans });
      },
      addEventToPlan: (event) => {
        const { plans, currentSelectedPlan } = get();
        const newPlans = plans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                events: plan.events ? plan.events.concat(event) : [event],
              }
            : plan
        );
        set({ plans: newPlans });
      },
      removeEventFromPlan: (event) => {
        const { plans, currentSelectedPlan } = get();
        const newPlans = plans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                events: plan.events?.filter(
                  (e) =>
                    e.title !== event.title &&
                    e.startTime !== event.startTime &&
                    e.endTime !== event.endTime &&
                    e.daysOfWeek !== event.daysOfWeek &&
                    e.description !== event.description
                ),
              }
            : plan
        );
        set({ plans: newPlans });
      },
      deleteCourseFromPlan: (course) => {
        const { plans, currentSelectedPlan } = get();
        const newPlans = plans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                courses: plan.courses?.filter((c) => c.code !== course),
              }
            : plan
        );
        set({ plans: newPlans });
      },
      updateCourseColor: (course, color) => {
        const { plans, currentSelectedPlan } = get();
        const newPlans = plans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                courses: plan.courses?.map((c) =>
                  c.code === course.code ? { ...c, color } : c
                ),
              }
            : plan
        );
        set({ plans: newPlans });
      },
      clearPlans: () => {
        set({
          plans: [],
          currentSelectedPlan: null,
        });
      },
      openCourseId: null,
      setOpenCourseId: (id) => set({ openCourseId: id }),
    }),
    {
      name: "plan-store",
      partialize: (state) => ({
        ...state,
        plans: state.plans.filter((plan) => !plan.isTemporary),
      }),
    }
  )
);

//run code on plan update
planStore.subscribe(
  debounce(async () => {
    if (!globalThis.location) return;
    const user = await fetch("/auth/profile");
    if (!(user.status === 200)) return;
    const json_user = await user.json();
    const currentPlanUUID = planStore.getState().currentSelectedPlan;
    const userId = json_user.sub;
    const persistentPlans = planStore
      .getState()
      .plans.filter((plan) => !plan.isTemporary);

    console.log(`Persistent Plans are:`);
    console.log(persistentPlans);
    if (userId && currentPlanUUID) {
      const currentPlan = persistentPlans.find(
        (plan) => plan.uuid === currentPlanUUID
      );
      //planStore.getState().getPlan(currentPlanUUID);
      if (currentPlan)
        uploadPlan(currentPlanUUID, currentPlan, await getAccessToken());
    } else {
      console.log("User is not authenticated");
    }
  }, 2500)
);

export async function syncPlans(saveLocal: boolean = true) {
  // boolean defaults to true so if no argument is passed, local plans are saved.
  console.log(`Syncing plans! Boolean is: ${saveLocal}`);
  const globalState = globalThis as unknown as { setPlans?: boolean };
  console.log(globalThis);
  if (globalState.setPlans) return;
  if (!globalThis.location) return;
  let localPlans: Plan[] = [];
  try {
    const user = await fetch("/auth/profile");
    if (user.status !== 200) return;

    if (!saveLocal) {
      planStore.getState().clearPlans();
    } else {
      localPlans = [...planStore.getState().plans]; // variable of local plans to be added
      const localSelected = planStore.getState().currentSelectedPlan; // if a local plan is selected
      if (localSelected) {
        localStorage.setItem("lastSelectedPlanUUID", localSelected);
      }

      for (const plan of localPlans) {
        await uploadPlan(plan.uuid, plan, await getAccessToken());
      }
    }
    const serverPlans = await getPlans(await getAccessToken());
    if (!serverPlans) return;

    const serverPlanMap = new Map<string, Plan>();
    for (const { planData } of serverPlans) {
      if (planData?.uuid) {
        serverPlanMap.set(planData.uuid, planData);
      }
    }
    planStore.getState().clearPlans();
    const finalPlans: Plan[] = [];
    if (saveLocal) {
      for (const localPlan of localPlans) {
        const synced = serverPlanMap.get(localPlan.uuid);
        finalPlans.push(synced ?? localPlan);
        serverPlanMap.delete(localPlan.uuid);
      }
    }
    console.log("Local plans:");
    console.log(localPlans);
    console.log("Server Plans:");
    for (const remaining of serverPlanMap.values()) {
      finalPlans.push(remaining);
    }
    console.log(`Final Plans are:`);
    console.log(finalPlans);
    for (const plan of finalPlans) {
      planStore.getState().addPlan(plan);
    }
    const rememberedUUID = localStorage.getItem("lastSelectedPlanUUID");
    if (rememberedUUID) {
      planStore.getState().selectPlan(rememberedUUID);
    }
  } catch (error) {
    console.error("Failed to sync plans:", error);
  } finally {
    globalState.setPlans = true;
  }
}

function equalPlans(a: Plan, b: Plan): boolean {
  return a.uuid === b.uuid;
}

export async function checkIfModalNeeded(): Promise<boolean> {
  const localPlans = planStore.getState().plans;

  if (localPlans.length === 0) return false;
  try {
    const user = await fetch("/auth/profile");
    if (user.status !== 200) return false;

    const serverPlansRaw: { planData: Plan | null }[] = await getPlans(
      await getAccessToken()
    );
    const serverPlans: Plan[] = serverPlansRaw
      .map(({ planData }) => planData)
      .filter((p): p is Plan => !!p);

    const serverMap = new Map(serverPlans.map((p) => [p.uuid, p]));

    for (const localPlan of localPlans) {
      const matchingServerPlan = serverMap.get(localPlan.uuid);
      if (
        (!matchingServerPlan || !equalPlans(localPlan, matchingServerPlan)) &&
        localPlan.isTemporary == false
      ) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error("Failed to check sync status:", err);
    return false;
  }
}

export async function loadLocalPlans() {
  const plans = planStore.getState().plans;

  if (plans.length === 0) {
    console.log("No local plans found");
    return;
  }

  const rememberedUUID = localStorage.getItem("lastSelectedPlanUUID");

  if (rememberedUUID) {
    planStore.getState().selectPlan(rememberedUUID);
  } else {
    planStore.getState().selectPlan(plans[0].uuid);
  }
}
