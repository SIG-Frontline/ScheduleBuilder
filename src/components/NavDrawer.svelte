<script lang="ts">
	// Importing necessary modules and states
	import { TABS } from '$lib/constants';
	import { drawerState } from '$lib/stores/drawerStateStore';
	import { Drawer } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	// Setting initial drawer position
	let drawerposition: 'bottom' | 'right' = 'bottom';

	// On component mount, check window width to set drawer position
	onMount(() => {
		if (window.matchMedia('(min-width: 1024px)').matches) {
			drawerposition = 'right';
		}
		// Add event listener to handle window resize
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
	<!-- Drawer component with dynamic position and width -->
	<Drawer
		position={drawerposition}
		width={drawerposition === 'right' ? 'w-96' : ''}
		regionBackdrop="invisible"
		regionDrawer="!visible lg:pr-20"
	>
		<!-- Loop over TABS to render the correct component based on drawerState -->
		{#each TABS as tab}
			{#if $drawerState === tab.id}
				<svelte:component this={tab.component} />
			{/if}
		{/each}
	</Drawer>
{/key}
<!-- Event listener for keydown event to close drawer on 'Escape' key press -->
<svelte:window
	on:keydown|stopPropagation={(e) => {
		if (e.key === 'Escape') {
			drawerState.set('closed');
		}
	}}
/>
