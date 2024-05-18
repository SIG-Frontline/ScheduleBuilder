<script lang="ts">
	import {
		AppBar,
		getModalStore,
		type ModalComponent,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import { THEMES } from '$lib/constants';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { setTheme } from '$lib/setTheme';
	import SmallScreenThemeModal from './Modals/SmallScreenThemeModal.svelte';
	import { themeState } from '$lib/themeStateStore';

	let isMounted = false;
	$: if (isMounted) setTheme($themeState);
	onMount(() => {
		isMounted = true;
	});
	const modalStore = getModalStore();
	function openModal() {
		const modalComponent: ModalComponent = { ref: SmallScreenThemeModal, props: { $themeState } };

		const modal: ModalSettings = {
			type: 'component',
			component: modalComponent
		};
		modalStore.trigger(modal);
	}
	//get the semesters from the server in the future
	let semesters = ['Summer', 'Fall', 'Winter', 'Spring'];
	let year = new Date().getFullYear();
	let SemesterYearArray = semesters.map((semester) => `${semester} ${year}`);
	let currentSemester = SemesterYearArray[0];
</script>

<AppBar
	gridColumns="grid-cols-3"
	slotDefault="place-self-center"
	slotTrail="place-content-end"
	class="sticky left-0 top-0 z-30"
>
	<svelte:fragment slot="lead">
		<select class="select md:w-48" bind:value={currentSemester}>
			{#each SemesterYearArray as semesterYear}
				<option value={semesterYear}>{semesterYear}</option>
			{/each}
		</select>
	</svelte:fragment>
	<h1 class="text-center text-2xl font-semibold">Schedule Builder</h1>
	<svelte:fragment slot="trail"
		><LightSwitch class="hidden md:block" />
		<select class="select hidden !w-48 md:block" bind:value={$themeState}>
			{#each THEMES as theme}
				<option value={theme.id}>{theme.label}</option>
			{/each}
		</select>
		<button type="button" class="variant-ghost btn-icon md:hidden" on:click={openModal}>
			<span class="material-symbols-outlined">palette</span>
		</button>
	</svelte:fragment>
</AppBar>
