import { create } from "zustand";

export type Filters = {
  honors: boolean;
  modality: string;
  graduate: boolean;
  undergraduate: boolean;
  creditCount: number | undefined;
  dayOfWeek: string;
};

interface FilterStoreState {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export const filterStore = create<FilterStoreState>((set) => ({
  filters: {
    honors: false,
    modality: "",
    graduate: false,
    undergraduate: false,
    creditCount: undefined,
    dayOfWeek: "",
  },
  setFilters: (filters) => set({ filters }),
}));
