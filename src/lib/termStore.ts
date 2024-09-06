import { writable, derived } from 'svelte/store';
export const termStore = writable(-1);
// https://svelte.dev/docs/svelte-store
export const humanReadableTerm = derived(termStore, ($term) => {
	if ($term === -1) return 'Loading...';
	let result = '';
	switch ($term.toString().substring(4, 6)) {
		case '90':
			result = 'Fall ';
			break;
		case '10':
			result = 'Spring ';
			break;
		case '50':
			result = 'Summer ';
			break;
		case '95':
			result = 'Winter ';
			break;
		default:
			result = 'Unknown ';
			break;
	}
	result += $term.toString().substring(0, 4);
	return result;
});

export const termSeason = derived(termStore, ($term) => {
	if ($term === -1) return 'Loading...';
	let result = '';
	switch ($term.toString().substring(4, 6)) {
		case '90':
			result = 'Fall';
			break;
		case '10':
			result = 'Spring';
			break;
		case '50':
			result = 'Summer';
			break;
		case '95':
			result = 'Winter';
			break;
		default:
			result = 'Unknown';
			break;
	}
	return result;
});