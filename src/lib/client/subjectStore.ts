import { create } from 'zustand';

interface SubjectStoreState {
  subjects: string[];
  term: number;
  setSubjects: (subjects: string[], term: number) => void;
}

export const subjectStore = create<SubjectStoreState>((set) => ({
  subjects: [],
  term: 0,
  setSubjects: (subjects, term) => set({ subjects, term }),
}));
