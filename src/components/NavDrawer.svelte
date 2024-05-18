<script lang="ts">
	import { TABS } from '$lib/constants';
	import { drawerState } from '$lib/drawerStateStore';
	import { Drawer } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	let drawerposition: 'bottom' | 'right' = 'bottom';

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

{#key drawerposition}
	<Drawer
		position={drawerposition}
		width={drawerposition === 'right' ? 'w-96' : ''}
		regionBackdrop="invisible"
		regionDrawer="!visible lg:pr-20"
	>
		{#each TABS as tab}
			{#if $drawerState === tab.id}
				<svelte:component this={tab.component} />
			{/if}
		{/each}
	</Drawer>
{/key}
<svelte:window
	on:keydown|stopPropagation={(e) => {
		if (e.key === 'Escape') {
			drawerState.set('closed');
		}
	}}
/>
