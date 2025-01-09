import { create } from "zustand";

interface dayStoreState {
  days: number[];
  setDays: (days: number[]) => void;
  toggleDay: (day: number) => void;
}

export const dayStore = create<dayStoreState>((set, get) => ({
  days: [],
  setDays: (days) => set({ days }),
  toggleDay: (day: number) => {
    const { days } = get();
    set(() => {
      if (days.includes(day)) {
        const retval = { days: days.filter((d) => d !== day) };
        if (retval.days.length === 7) {
          return { days: days };
        }
        return retval;
      } else {
        const retval = { days: [...days, day] };
        if (retval.days.length === 7) {
          return { days: days };
        }
        return retval;
      }
    });
  },
}));
