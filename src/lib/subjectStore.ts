import { create } from "zustand";

interface SubjectStoreState {
  subjects: string[];
  setSubjects: (subjects: string[]) => void;
}

export const subjectStore = create<SubjectStoreState>((set) => ({
  subjects: [],
  setSubjects: (subjects) => set({ subjects }),
}));
