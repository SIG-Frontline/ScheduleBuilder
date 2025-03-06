import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface PlanStoreState {
  plans: Plan[];
  tempPlans: Plan[]; // New state variable for temporary plans
  currentSelectedPlan: string | null;
  setPlans: (plans: Plan[]) => void;
  addPlan: (newPlan: Plan) => void;
  addTempPlan: (newPlan: Plan) => void; // New function for adding temporary plans
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
}

export const planStore = create<PlanStoreState>()(
  persist(
    (set, get) => ({
      plans: [],
      tempPlans: [], // Initialize the temporary plans state
      currentSelectedPlan: null,
      setPlans: (plans) => set({ plans }),
      addPlan: (newPlan) => {
        const { plans } = get();
        if (plans.length === 0) {
          newPlan.selected = true;
        }
        set({ plans: [...plans, newPlan], currentSelectedPlan: newPlan.uuid });
      },
      addTempPlan: (newPlan) => {
        const { tempPlans } = get();
        if (tempPlans.length === 0) {
          newPlan.selected = true;
        }
        set({
          tempPlans: [...tempPlans, newPlan],
          currentSelectedPlan: newPlan.uuid,
        });
      },
      selectPlan: (uuid) => {
        const { plans, tempPlans } = get();
        const newPlans = plans.map((plan) => ({
          ...plan,
          selected: plan.uuid === uuid,
        }));
        const newTempPlans = tempPlans.map((plan) => ({
          ...plan,
          selected: plan.uuid === uuid,
        }));
        set({
          plans: newPlans,
          tempPlans: newTempPlans,
          currentSelectedPlan: uuid,
        });
      },
      updatePlan: (updatedPlan, uuid) => {
        const { plans, tempPlans } = get();
        set({
          plans: plans.map((plan) => (plan.uuid === uuid ? updatedPlan : plan)),
          tempPlans: tempPlans.map((plan) =>
            plan.uuid === uuid ? updatedPlan : plan
          ),
        });
      },
      removePlan: (uuid) => {
        const { plans, tempPlans, currentSelectedPlan } = get();
        let newSelectedPlan = currentSelectedPlan;
        if (currentSelectedPlan === uuid && plans.length > 1) {
          newSelectedPlan = plans[0].uuid;
        } else if (currentSelectedPlan === uuid && plans.length === 1) {
          newSelectedPlan = null;
        }
        set({
          plans: plans.filter((plan) => plan.uuid !== uuid),
          tempPlans: tempPlans.filter((plan) => plan.uuid !== uuid),
          currentSelectedPlan: newSelectedPlan,
        });
      },
      getPlan: (uuid) => {
        const { plans, tempPlans } = get();
        return (
          plans.find((plan) => plan.uuid === uuid) ||
          tempPlans.find((plan) => plan.uuid === uuid)
        );
      },
      addCourseToPlan: (course) => {
        const { plans, tempPlans, currentSelectedPlan } = get();
        const currentPlan =
          plans.find((plan) => plan.uuid === currentSelectedPlan) ||
          tempPlans.find((plan) => plan.uuid === currentSelectedPlan);
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
                  courses: plan.courses
                    ? plan.courses.concat(course)
                    : [course],
                }
              : plan
          ),
          tempPlans: tempPlans.map((plan) =>
            plan.uuid === currentSelectedPlan
              ? {
                  ...plan,
                  courses: plan.courses
                    ? plan.courses.concat(course)
                    : [course],
                }
              : plan
          ),
        });
      },
      selectSection: (course, crn) => {
        const { plans, tempPlans, currentSelectedPlan } = get();
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
        const newTempPlans = tempPlans.map((plan) =>
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
        set({ plans: newPlans, tempPlans: newTempPlans });
      },
      addEventToPlan: (event) => {
        const { plans, tempPlans, currentSelectedPlan } = get();
        const newPlans = plans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                events: plan.events ? plan.events.concat(event) : [event],
              }
            : plan
        );
        const newTempPlans = tempPlans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                events: plan.events ? plan.events.concat(event) : [event],
              }
            : plan
        );
        set({ plans: newPlans, tempPlans: newTempPlans });
      },
      removeEventFromPlan: (event) => {
        const { plans, tempPlans, currentSelectedPlan } = get();
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
        const newTempPlans = tempPlans.map((plan) =>
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
        set({ plans: newPlans, tempPlans: newTempPlans });
      },
      deleteCourseFromPlan: (course) => {
        const { plans, tempPlans, currentSelectedPlan } = get();
        const newPlans = plans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                courses: plan.courses?.filter((c) => c.code !== course),
              }
            : plan
        );
        const newTempPlans = tempPlans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                courses: plan.courses?.filter((c) => c.code !== course),
              }
            : plan
        );
        set({ plans: newPlans, tempPlans: newTempPlans });
      },
      updateCourseColor: (course, color) => {
        const { plans, tempPlans, currentSelectedPlan } = get();
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
        const newTempPlans = tempPlans.map((plan) =>
          plan.uuid === currentSelectedPlan
            ? {
                ...plan,
                courses: plan.courses?.map((c) =>
                  c.code === course.code ? { ...c, color } : c
                ),
              }
            : plan
        );
        set({ plans: newPlans, tempPlans: newTempPlans });
      },
    }),
    {
      name: "plan-store",
      partialize: (state) => ({
        plans: state.plans,
        currentSelectedPlan: state.currentSelectedPlan,
      }), // Exclude tempPlans from being persisted
    }
  )
);

//run code on plan update
planStore.subscribe(
  debounce(async () => {
    if (!globalThis.location) return;
    const user = await fetch("/api/auth/me");
    if (!(user.status === 200)) return;
    const json_user = await user.json();
    if (json_user?.sub) {
      uploadPlan();
    } else {
      console.log("User is not authenticated");
    }
  }, 2500)
);

async function uploadPlan() {
  const currentPlanUUID = planStore.getState().currentSelectedPlan;
  if (currentPlanUUID) {
    const currentPlan = planStore.getState().getPlan(currentPlanUUID);
    if (currentPlan && JSON.stringify(currentPlan) !== "{}") {
      await fetch("/api/user_plans", {
        method: "POST",
        body: JSON.stringify(currentPlan),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        });
    }
  }
}

(async function syncPlans() {
  if (
    (
      globalThis as unknown as {
        setPlans: boolean;
      }
    ).setPlans
  )
    return;
  if (!globalThis.location) return;
  const user = await fetch("/api/auth/me");
  if (!(user.status === 200)) return;
  const json_user = await user.json();
  if (json_user?.sub) {
    //clear the plans
    planStore.getState().setPlans([]);
    await fetch("/api/user_plans")
      .then((res) => res.json())
      .then((data) => {
        let i = 0;
        for (const plan of data) {
          data.selected = i === 0;
          planStore.getState().addPlan(plan.plandata);
          i++;
        }
      })
      .finally(() => {
        (
          globalThis as unknown as {
            setPlans: boolean;
          }
        ).setPlans = true;
      });
  }
})();
