import { browser } from '$app/environment';
import { writable } from 'svelte/store';
export const themeState = writable(browser ? localStorage.getItem('theme') : 'rocket');
themeState.subscribe((value) => {
	if (browser) {
		localStorage.setItem('theme', value ?? 'rocket');
	}
});
