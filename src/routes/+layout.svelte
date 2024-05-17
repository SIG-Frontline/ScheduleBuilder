<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import 'material-symbols';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { AppBar } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { initializeStores, Drawer } from '@skeletonlabs/skeleton';
	import SearchTab from '../components/Tabs/SearchTab.svelte';
	import PlansTab from '../components/Tabs/PlansTab.svelte';
	let drawerState = 'closed';
	initializeStores();
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	const drawerStore = getDrawerStore();

	$: drawerposition = 'bottom' as 'bottom' | 'right';
	onMount(() => {
		if (window.matchMedia('(min-width: 1024px)').matches) {
			drawerposition = 'right';
		}
		window.addEventListener('resize', () => {
			if (window.matchMedia('(min-width: 1024px)').matches) {
				drawerposition = 'right';
			} else {
				drawerposition = 'bottom';
			}
		});
	});
	let tabs = [
		{
			id: 'search',
			icon: 'search', //material-symbols icon name
			label: 'search',
			component: SearchTab
		},
		{
			id: 'plans',
			icon: 'list', //material-symbols icon name
			label: 'plans',
			component: PlansTab
		}
	];
	let tabSet: number = 0;
	let themes = [
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
	let selectedTheme = 'skeleton';
	$: setTheme(selectedTheme);
	let setTheme = (selectedTheme) => {};
	onMount(() => {
		setTheme = (selectedThemeVal) => {
			document.body.setAttribute('data-theme', selectedThemeVal);
		};
	});
</script>

<main class="relative overflow-hidden lg:mr-20">
	{#key drawerposition}
		<Drawer position={drawerposition} width={drawerposition === 'right' ? 'w-96' : ''}>
			{#each tabs as tab}
				{#if drawerState === tab.id}
					<svelte:component this={tab.component} />
				{/if}
			{/each}
		</Drawer>
	{/key}
	<AppBar
		gridColumns="grid-cols-3"
		slotDefault="place-self-center"
		slotTrail="place-content-end"
		class="sticky left-0 top-0 z-30"
	>
		<svelte:fragment slot="lead">(icon)</svelte:fragment>
		<h1>hello there</h1>
		<svelte:fragment slot="trail"
			><LightSwitch />
			<select class="select !w-48" bind:value={selectedTheme}>
				{#each themes as theme}
					<option value={theme.id}>{theme.label}</option>
				{/each}
			</select>
		</svelte:fragment>
	</AppBar>
	<slot />
</main>
<TabGroup
	justify="justify-center"
	active="variant-filled-primary"
	hover="hover:variant-soft-primary"
	flex="flex-1 lg:flex-none"
	rounded=""
	border=""
	regionList="lg:flex lg:flex-col"
	class="bg-surface-100-800-token fixed bottom-0 left-0 right-0 z-50 w-screen lg:bottom-0 lg:left-[unset] lg:top-0 lg:z-50 lg:h-full lg:w-20"
>
	{#each tabs as tab, i}
		<Tab
			bind:group={tabSet}
			name={tab.id}
			class="flex-1"
			value={i}
			on:click={() => {
				if (drawerState === tab.id) {
					drawerState = 'closed';
					drawerStore.close();
				} else {
					drawerState = tab.id;
					drawerStore.open();
				}
			}}
		>
			<svelte:fragment slot="lead"
				><span class="material-symbols-outlined"> {tab.icon} </span></svelte:fragment
			>
			<span>{tab.label}</span>
		</Tab>
	{/each}
</TabGroup>
