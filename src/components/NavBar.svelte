<script lang="ts">
	// Importing necessary components, types and functions from the libraries
	import {
		AppBar,
		getModalStore,
		type ModalComponent,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import { THEMES } from '$lib/constants'; // Importing theme constants
	import { LightSwitch } from '@skeletonlabs/skeleton'; // Importing LightSwitch component
	import { onMount } from 'svelte'; // Importing onMount function from svelte
	import { setTheme } from '$lib/setTheme'; // Importing setTheme function
	import SmallScreenThemeModal from './Modals/SmallScreenThemeModal.svelte'; // Importing SmallScreenThemeModal component
	import { themeState } from '$lib/themeStateStore'; // Importing themeState store
	import { termStore } from '$lib/termStore'; // Importing termStore

	// Initializing variables
	let isMounted = false;
	let SemesterYearArray: { label: string; code: number }[] = [];
	// Watching for changes in isMounted variable and setting theme when it changes
	$: if (isMounted) setTheme($themeState);
	onMount(() => {
		// Setting isMounted to true when component mounts
		isMounted = true;
		// Fetching terms from the API
		fetch('/api/terms')
			.then((res) => res.json())
			.then((data) => {
				// Looping through the courses and setting the termStore and SemesterYearArray
				for (let i = 0; i < data.courses.length; i++) {
					if ($termStore == -1) termStore.set(data.courses[i].TERM);
					let termtoadd;
					// Switch case to determine the term to add based on the TERM value
					switch (data.courses[i].TERM.substring(4, 6)) {
						case '90':
							termtoadd = 'Fall';
							break;
						case '10':
							termtoadd = 'Spring';
							break;
						case '50':
							termtoadd = 'Summer';
							break;
						case '95':
							termtoadd = 'Winter';
							break;
						default:
							termtoadd = 'Unknown';
							break;
					}
					termtoadd = termtoadd + ' ' + data.courses[i].TERM.substring(0, 4);

					// Updating SemesterYearArray with the new term
					SemesterYearArray = [
						...SemesterYearArray,
						{ label: termtoadd, code: data.courses[i].TERM }
					];
				}
			});
	});
	// Getting the modal store
	const modalStore = getModalStore();
	function openModal() {
		// Function to open the modal
		const modalComponent: ModalComponent = { ref: SmallScreenThemeModal, props: { $themeState } };

		const modal: ModalSettings = {
			type: 'component',
			component: modalComponent
		};
		// Triggering the modal
		modalStore.trigger(modal);
	}
</script>

<!-- AppBar component with various slots and classes -->
<AppBar
	gridColumns="grid-cols-3"
	slotDefault="place-self-center"
	slotTrail="place-content-end"
	class="sticky left-0 top-0 z-30"
>
	<svelte:fragment slot="lead">
		<!-- Await block to wait for the termStore to be not -1 and then render the select element with the SemesterYearArray -->
		{#await new Promise((resolve) => ($termStore !== -1 ? resolve(SemesterYearArray) : null))}
			<select class="select !placeholder min-h-10 md:w-48" disabled> </select>
		{:then _}
			<select class="select md:w-48" bind:value={$termStore}>
				{#each SemesterYearArray as { label: semesterYear, code: semesterCode }}
					<option value={semesterCode}>{semesterYear}</option>
				{/each}
			</select>
		{/await}
	</svelte:fragment>
	<!-- Title of the page -->
	<h1 class="text-center text-2xl font-semibold">Schedule Builder</h1>
	<svelte:fragment slot="trail"
		><!-- LightSwitch component and select element for theme selection. Also a button to open the modal -->
		<LightSwitch class="hidden md:block" />
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
