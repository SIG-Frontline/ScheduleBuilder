import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { termStore } from './termStore';
const defaultData = [] as Array<unknown>;
const PLAN_KEY = 'SB_plans'; // key for local storage
export const planStore = writable(
	browser && localStorage.getItem(PLAN_KEY) !== null // check if the key exists in local storage
		? JSON.parse(localStorage.getItem(PLAN_KEY) as string) // if it does, parse the value
		: defaultData // if it doesn't, use the default value in the store
);
planStore.subscribe((value) => {
	if (browser) {
		// if the browser is available, set the value in local storage
		//if the old value is null, set the default value
		localStorage.setItem(PLAN_KEY, JSON.stringify(value) ?? JSON.stringify(defaultData));
	}

	//when a plan is selected, update the term store
	if (value.length > 0) {
		//find the active plan
		const activePlan = value.find((plan: { active: boolean }) => plan.active);
		//if the active plan is found, update the term store
		if (activePlan) {
			termStore.set(activePlan.term);
		}
	}
});
// https://svelte.dev/docs/svelte-store
