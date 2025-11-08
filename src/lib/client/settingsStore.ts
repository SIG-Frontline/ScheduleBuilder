import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  decryptArr,
  encryptArr,
  getTakenCourses,
  setTakenCourses,
} from '../server/actions/getTakenCourses';
import { getAccessToken } from '@auth0/nextjs-auth0';

interface SettingsStoreState {
  encryptedTakenCourses: string; // Encrypted string[]
  getCourses: () => Promise<string[]>;
  addCourse: (course: string) => void;
  removeCourse: (course: string) => void;
  clearCourses: () => void;
  setCourses: (courses: string) => void;
}

export const settingsStore = create<SettingsStoreState>()(
  persist(
    (set, get) => ({
      encryptedTakenCourses: '',
      getCourses: async () => {
        const { encryptedTakenCourses: takenCourses } = get();
        return await decryptArr(takenCourses);
      },
      addCourse: async (course) => {
        const { encryptedTakenCourses: takenCourses } = get();

        const decryptedArr = await decryptArr(takenCourses);
        if (!decryptedArr.includes(course)) decryptedArr.push(course);

        const encryptedArr = await encryptArr(decryptedArr);
        if (!encryptedArr) return;

        set({ encryptedTakenCourses: encryptedArr });

        updateDB(encryptedArr);
      },
      removeCourse: async (course) => {
        const { encryptedTakenCourses: takenCourses } = get();

        let decryptedArr = await decryptArr(takenCourses);
        decryptedArr = decryptedArr.filter((item) => item !== course);

        const encryptedArr = await encryptArr(decryptedArr);
        if (!encryptedArr) return;

        set({ encryptedTakenCourses: encryptedArr });

        updateDB(encryptedArr);
      },
      clearCourses: () => set({ encryptedTakenCourses: '' }),
      setCourses: (courses) => set({ encryptedTakenCourses: courses }),
    }),
    {
      name: 'settings-store',
    },
  ),
);

// Helper function to update the database
async function updateDB(encryptedArr: string) {
  const user = await fetch('/auth/profile');
  if (!(user.status === 200)) {
    console.log('User is not authenticated');
    return;
  }

  await setTakenCourses(await getAccessToken(), encryptedArr);
}

// FIX: this should be ran on the load of the settings page
// Right now it runs on reload, which might not always work
(async function syncCourses() {
  try {
    console.log('Syncing courses...');
    const user = await fetch('/auth/profile');
    if (user.status !== 200) return;

    const data = await getTakenCourses(await getAccessToken());
    if (!data) return;

    settingsStore.getState().clearCourses();
    settingsStore.getState().setCourses(data);
  } catch (error) {
    console.error('Failed to sync settings:', error);
  }
})();
