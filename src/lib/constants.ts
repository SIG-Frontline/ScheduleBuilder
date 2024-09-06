import PlansTab from '../components/Tabs/PlansTab.svelte';
import SearchTab from '../components/Tabs/SearchTab.svelte';
import FilterTab from '../components/Tabs/FilterTab.svelte';

export const THEMES = [
	{
		id: 'skeleton',
		label: 'Skeleton'
	},
	{
		id: 'modern',
		label: 'Modern'
	},
	{
		id: 'crimson',
		label: 'Crimson'
	},
	{
		id: 'hamlindigo',
		label: 'Hamlindigo'
	},
	{
		id: 'gold-nouveau',
		label: 'Gold Nouveau'
	},
	{
		id: 'rocket',
		label: 'Rocket'
	},
	{
		id: 'seafoam',
		label: 'Seafoam'
	},
	{
		id: 'sahara',
		label: 'Sahara'
	},
	{
		id: 'vintage',
		label: 'Vintage'
	},
	{
		id: 'wintry',
		label: 'Wintry'
	},
	{
		id: 'test-theme',
		label: 'Test Theme'
	}
];
export const TABS = [
	{
		id: 'search',
		icon: 'search', //material-symbols icon name
		label: 'search',
		component: SearchTab
	},
	{
		id: 'filter',
		icon: 'instant_mix', //material-symbols icon name
		label: 'filter',
		component: FilterTab
	},
	{
		id: 'plans',
		icon: 'list', //material-symbols icon name
		label: 'plans',
		component: PlansTab
	}
];
