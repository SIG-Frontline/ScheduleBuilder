import { browser } from '$app/environment';
import { writable } from 'svelte/store';
export const themeState = writable(browser ? (localStorage.getItem('theme') as string) : 'rocket');
themeState.subscribe((value) => {
	if (browser) {
		localStorage.setItem('theme', value ?? 'rocket');
	}
});
