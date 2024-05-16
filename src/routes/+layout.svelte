<script lang="ts">
	import { TabGroup, TabAnchor } from '@skeletonlabs/skeleton';
	import { AppBar } from '@skeletonlabs/skeleton';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { initializeStores, Drawer } from '@skeletonlabs/skeleton';
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
</script>

<main class="relative overflow-hidden lg:mr-20">
	{#key drawerposition}
		<Drawer position={drawerposition} width={drawerposition === 'right' ? 'w-96' : ''}>
			{#if $drawerStore.id === 'drawer1'}
				<h1>this is example 1</h1>
			{:else if $drawerStore.id === 'drawer2'}
				<h1>this is example 2</h1>
			{:else}
				<h1>default</h1>
			{/if}
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
		<svelte:fragment slot="trail"><h1>test</h1></svelte:fragment>
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
	<TabAnchor
		on:click={() => {
			if (drawerState === 'drawer1') {
				drawerStore.close();
				drawerState = 'closed';
			} else {
				drawerStore.open({ id: 'drawer1' });
				drawerState = 'drawer1';
			}
		}}
		selected={drawerState === 'drawer1'}
	>
		<svelte:fragment slot="lead">(icon1)</svelte:fragment>
		<span>index</span>
	</TabAnchor>
	<TabAnchor
		on:click={() => {
			if (drawerState === 'drawer2') {
				drawerStore.close();
				drawerState = 'closed';
			} else {
				drawerStore.open({ id: 'drawer2' });
				drawerState = 'drawer2';
			}
		}}
		selected={drawerState === 'drawer2'}
	>
		<svelte:fragment slot="lead">(icon2)</svelte:fragment>
		<span>home</span>
	</TabAnchor>
</TabGroup>
