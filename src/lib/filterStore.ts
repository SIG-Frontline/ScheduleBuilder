import { derived, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { termSeason } from '$lib/termStore';
import { get } from 'svelte/store';


const defaultData = {
    selectedSubjects: [],
    sectionStatus: 'Any',
    isHonors: 'Any',
    isAsync: 'Any',
    creditsMin: 0,
    creditsMax: 20,
    courseLevelMin: 0,
    courseLevelMax: 10,
    selectedSummerPeriods: [],
    selectedInstructionMethods: []
}
const FILTER_KEY = "SB_Filter"
export const filterStore = writable(
        browser && localStorage.getItem(FILTER_KEY) !== null // check if the key exists in local storage
    ? JSON.parse(localStorage.getItem(FILTER_KEY) as string) // if it does, parse the value
    : defaultData // if it doesn't, use the default value in the store
);
export function reset() {
    filterStore.set(defaultData)
}
export const queryString = derived(filterStore, ($filter) => {
    let data: Record<string, string> = {};

    if ($filter.isHonors !== 'Any') {
        data.honors = ($filter.isHonors === 'Honors').toString();
    }
    if ($filter.isAsync !== 'Any') {
        data.async = ($filter.isAsync === 'Async').toString();
    }

    if ($filter.selectedSubjects.length > 0) {
        data.subject = 'in!' + $filter.selectedSubjects.join('|'); // Joining array into a comma-separated string
    }

    if ($filter.selectedInstructionMethods.length > 0) {
        data.method = 'in!' + $filter.selectedInstructionMethods.join('|');
    }

    if (get(termSeason) === 'Summer' && $filter.selectedSummerPeriods.length > 0) {
        data.summer = 'in!' + $filter.selectedSummerPeriods.join('|');
    }

    data.credits = `range!${$filter.creditsMin}|${$filter.creditsMax}`
    data.level = `range!${$filter.courseLevelMin}|${$filter.courseLevelMax}`

    // Convert data object to query string
    const params = new URLSearchParams(data);
    console.log(params.toString()); // Check the output
    return params.toString();
});
filterStore.subscribe((value) => {
	if (browser) {
		// if the browser is available, set the value in local storage
		//if the old value is null, set the default value
		localStorage.setItem(FILTER_KEY, JSON.stringify(value) ?? JSON.stringify(defaultData));
	}
});