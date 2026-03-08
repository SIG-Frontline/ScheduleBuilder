import { create } from "zustand";
import { Plan } from "./planStore";
import { createJSONStorage, persist } from "zustand/middleware";

// A session-store cache to store the 5 top plans the organizer 
interface BestPlansStoreState {
  plans: Plan[];
  index: number;
  setPlans: (plans: Plan[]) => void;
  getNext: () => Plan;
  getIndex: () => number;
  getSize: () => number;
}

export const bestPlansStore = create<BestPlansStoreState>()(
  persist(
    (set, get) => ({
      plans: [],
      index: 0,
      setPlans(plans) {
        set({ plans: plans, index: 0 });
      },
      getNext() {
        const { plans } = get();
        let { index } = get();

        index++;
        if (index >= plans.length) index = 0;

        console.log(index);

        set({ index: index });
        return plans[index];
      },
      getIndex() {
        const { index } = get();
        return index;
      },
      getSize() {
        const { plans } = get();
        return plans.length;
      },
    }),
    {
      name: "best-plans-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
