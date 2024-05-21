<script lang="ts">
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { TABS } from '$lib/constants';
	import { drawerState } from '$lib/drawerStateStore';
	let tabSet: number = 0;
	const drawerStore = getDrawerStore();
</script>

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
	{#each TABS as tab, i}
		<Tab
			bind:group={tabSet}
			name={tab.id}
			class="flex-1"
			value={i}
			on:click={() => {
				if ($drawerState === tab.id) {
					drawerState.set('closed');
					drawerStore.close();
				} else {
					drawerState.set(tab.id);
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
