import { browser } from '$app/environment';
import { writable } from 'svelte/store';
const defaultData = 'rocket'; // default theme
const THEME_KEY = 'SB_theme'; // key for local storage
export const themeState = writable(
	browser && localStorage.getItem(THEME_KEY) !== null // check if the key exists in local storage
		? (localStorage.getItem(THEME_KEY) as string) // if it does, parse the value
		: defaultData // if it does, parse the value
);
themeState.subscribe((value) => {
	if (browser) {
		// if the browser is available, set the value in local storage
		//if the old value is null, set the default value
		localStorage.setItem(THEME_KEY, value ?? defaultData);
	}
});
// https://svelte.dev/docs/svelte-store
