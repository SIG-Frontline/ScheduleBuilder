import { derived, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { termSeason } from '$lib/termStore';
import { get } from 'svelte/store';


const defaultData = {
    selectedSubjects: [],
    avoidMode: "None",
    sectionStatus: 'Any',
    isHonors: 'Any',
    isAsync: 'Any',
    creditsMin: 0,
    creditsMax: 20,
    courseLevelMin: 0,
    courseLevelMax: 10,
    selectedSummerPeriods: [],
    selectedInstructionMethods: [],
    selectedDays: ['U', 'M', 'T', 'W', 'R', 'F', 'S'],
    excludedBuildings: []
}
const FILTER_KEY = "SB_Filter"
export const filterStore = writable(
        browser && localStorage.getItem(FILTER_KEY) !== null // check if the key exists in local storage
    ? JSON.parse(localStorage.getItem(FILTER_KEY) as string) // if it does, parse the value
    : JSON.parse(JSON.stringify(defaultData)) // if it doesn't, use the default value in the store
);
export function reset() {
    console.log(defaultData)
    filterStore.set(JSON.parse(JSON.stringify(defaultData)))
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

    if ($filter.selectedDays.length > 0) {
        data.day = $filter.selectedDays.join('|');
    }

    if ($filter.excludedBuildings.length > 0) {
        data.building = 'nin!' + $filter.excludedBuildings.join('|');
    }

    data.credits = `range!${$filter.creditsMin}|${$filter.creditsMax}`
    data.level = `range!${$filter.courseLevelMin}|${$filter.courseLevelMax}`

    // Convert data object to query string
    const params = new URLSearchParams(data);
    console.log(params.toString()); // Check the output
    console.log($filter)
    return params.toString();
});

export const isFilterActive = derived(filterStore, (filter) => {
    return (Object.keys(defaultData) as Array<keyof typeof defaultData>).every((key) => {
        // For array properties, perform a shallow comparison to check if the arrays contain the same elements
        if (Array.isArray(defaultData[key])) {
            return (
                Array.isArray(filter[key]) &&
                (defaultData[key] as unknown[]).length === (filter[key] as unknown[]).length &&
                (defaultData[key] as unknown[]).every((val, index) => val === (filter[key] as unknown[])[index])
            );
        }
        // For other properties, perform a strict equality check
        return filter[key] === defaultData[key];
    });
})

filterStore.subscribe((value) => {
	if (browser) {
        console.log(defaultData)
		// if the browser is available, set the value in local storage
		//if the old value is null, set the default value
		localStorage.setItem(FILTER_KEY, JSON.stringify(value) ?? JSON.stringify(defaultData));
	}
});