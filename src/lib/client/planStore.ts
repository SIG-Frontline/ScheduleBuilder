import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uploadPlan } from "../server/actions/uploadPlan";
import { getPlans } from "../server/actions/getPlans";
import { deletePlan } from "../server/actions/deletePlan";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { getSectionData } from "../server/actions/getSectionData";

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
  organizerSettings: organizerSettings;
};

export type Course = {
  title: string;
  code: string;
  description: string;
  prerequisites: string[];
  credits: number;
  sections: Section[];
  color?: string;
  exp: Date;
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
  refreshPlan: () => void;
}

export const planStore = create<PlanStoreState>()(
  persist(
    (set, get) => ({
      plans: [],
      currentSelectedPlan: null,
      setPlans: (plans) => set({ plans }),
      addPlan: (newPlan) => {
        const { plans } = get();
        if (plans.length === 0) {
          newPlan.selected = true;
        }
        set({ plans: [...plans, newPlan], currentSelectedPlan: newPlan.uuid });
      },
      selectPlan: (uuid) => {
        const { plans } = get();
        const newplans = plans.map((plan) => ({
          ...plan,
          selected: plan.uuid === uuid,
        }));
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
        //add the expiration date to the course
        const expirationDate = new Date();
        //add 3 days to the current date
        expirationDate.setDate(expirationDate.getDate() + 3);
        course.exp = expirationDate;

        set({
          plans: plans.map((plan) =>
            plan.uuid === currentSelectedPlan
              ? {
            ...plan,
            courses: plan.courses
              ? [course, ...plan.courses]
              : [course],
          }
              : plan
          ),
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
      refreshPlan: async () => {
        const { plans } = get();
        //set on global state to prevent multiple calls
        const globalState = globalThis as unknown as { setPlans?: boolean };
        if (globalState.setPlans) return;
        globalState.setPlans = true;
        console.log(plans);

        //loop over all plans
        plans.forEach((plan) => {
          // courses
          plan.courses?.forEach(async (course) => {
            const exp_date = course.exp;
            // if the course is expired,refresh the course
            if (exp_date) {
              const currentDate = new Date();
              const expirationDate = new Date(exp_date);

              if (expirationDate < currentDate) {
                console.log(`Course ${course.code} is expired, refreshing...`);

                const newExpirationDate = new Date();
                //add 3 days to the current date
                newExpirationDate.setDate(newExpirationDate.getDate() + 3);
                //update the course with the new expiration date
                // setTimeout(async () => {
                const newCourseData = await getSectionData(
                  plan?.term ?? 202490,
                  course.code.split(" ")[0],
                  course.code.split(" ")[1]
                );
                const newCourse = {
                  ...newCourseData,
                  exp: newExpirationDate,
                  color: course.color,
                };
                set((state) => ({
                  plans: state.plans.map((p) =>
                    p.uuid === plan.uuid
                      ? {
                          ...p,
                          courses: p.courses?.map((c) =>
                            c.code === course.code ? newCourse : c
                          ),
                        }
                      : p
                  ),
                }));
                // }, 0);
              }
            }
          });
        });
      },
    }),
    {
      name: "plan-store",
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
    if (userId && currentPlanUUID) {
      const currentPlan = planStore.getState().getPlan(currentPlanUUID);
      uploadPlan(currentPlanUUID, currentPlan, await getAccessToken());
    } else {
      console.log("User is not authenticated");
    }
  }, 2500)
);

export async function syncPlans() {
  const globalState = globalThis as unknown as { setPlans?: boolean };
  if (globalState.setPlans) return;
  if (!globalThis.location) return;

  try {
    const user = await fetch("/auth/profile");
    if (user.status !== 200) return;
    planStore.getState().setPlans([]);
    const data = await getPlans(await getAccessToken());
    if (!data) return;
    let i = 0;
    for (const plan of data) {
      if (plan.planData && plan.planData.term) {
        plan.selected = i === 0;
        planStore.getState().addPlan(plan.planData);
        i++;
      }
    }
  } catch (error) {
    console.error("Failed to sync plans:", error);
  } finally {
    globalState.setPlans = true;
  }
}
