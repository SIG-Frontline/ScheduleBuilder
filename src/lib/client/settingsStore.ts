import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decryptArr, encryptArr, getTakenCourses, setTakenCourses } from "../server/actions/getTakenCourses";

interface SettingsStoreState {
	takenCourses: string; // Encrypted string[]
	getCourses: () => Promise<string[]>;
	addCourse: (course: string) => void;
	removeCourse: (course: string) => void;
	clearCourses: () => void;
	setCourses: (courses: string) => void;
}

export const settingsStore = create<SettingsStoreState>()(
	persist(
		(set, get) => ({
			takenCourses: "",
			getCourses: async () => {
				const { takenCourses } = get();
				return await decryptArr(takenCourses);
			},
			addCourse: async (course) => {
				const { takenCourses } = get();

				const decryptedArr = await decryptArr(takenCourses);
				if (!decryptedArr.includes(course)) decryptedArr.push(course);

				const encryptedArr = await encryptArr(decryptedArr);
				if(!encryptedArr) return;

				set({ takenCourses: encryptedArr });

				updateDB(encryptedArr);
			},
			removeCourse: async (course) => {
				const { takenCourses } = get();

				let decryptedArr = await decryptArr(takenCourses);
				decryptedArr = decryptedArr.filter((item) => item !== course);

				const encryptedArr = await encryptArr(decryptedArr);
				if(!encryptedArr) return;

				set({ takenCourses: encryptedArr });

				updateDB(encryptedArr);
			},
			clearCourses: () => set({takenCourses: ""}),
			setCourses: (courses) => set({takenCourses: courses})
		}),
		{
			name: "settings-store",
		}
	)
)

// Helper function to update the database
async function updateDB(encryptedArr: string) {
	const user = await fetch("/api/auth/me");
	if(!(user.status === 200)) {
		console.log("User is not authenticated");
		return;
	}
	const json_user = await user.json();
	const userId = json_user.sub;

	await setTakenCourses(userId, encryptedArr);
}

(async function syncCourses() {
	try {
		console.log("Syncing courses...");
		const user = await fetch("/api/auth/me");
		if (user.status !== 200) return;

		const json_user = await user.json();
		const userId = json_user.sub;
		if (!userId) return;

		const data = await getTakenCourses(userId);
		if (!data) return;

		settingsStore.getState().clearCourses();
		settingsStore.getState().setCourses(data);

	} catch (error) {
		console.error("Failed to sync settings:", error);
	} 
})();
