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
	import { termStore } from '$lib/termStore';

	let isMounted = false;
	let SemesterYearArray: any = [];
	$: if (isMounted) setTheme($themeState);
	onMount(() => {
		isMounted = true;
		fetch('/api/terms')
			.then((res) => res.json())
			.then((data) => {
				for (let i = 0; i < data.courses.length; i++) {
					if ($termStore == -1) termStore.set(data.courses[i].TERM);
					let termtoadd;
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

					SemesterYearArray = [
						...SemesterYearArray,
						{ label: termtoadd, code: data.courses[i].TERM }
					];
				}
			});
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
</script>

<AppBar
	gridColumns="grid-cols-3"
	slotDefault="place-self-center"
	slotTrail="place-content-end"
	class="sticky left-0 top-0 z-30"
>
	<svelte:fragment slot="lead">
		{#await new Promise((resolve) => ($termStore !== -1 ? resolve(SemesterYearArray) : null))}
			<select class="select !placeholder min-h-10 md:w-48" disabled> </select>
		{:then SemesterYearArray}
			<select class="select md:w-48" bind:value={$termStore}>
				{#each SemesterYearArray as { label: semesterYear, code: semesterCode }}
					<option value={semesterCode}>{semesterYear}</option>
				{/each}
			</select>
		{/await}
	</svelte:fragment>
	<h1 class="text-center text-2xl font-semibold">Schedule Builder</h1>
	<svelte:fragment slot="trail"
		><LightSwitch class="hidden md:block" />
		<select class="select hidden !w-48 md:block" bind:value={$themeState}>
			{#each THEMES as theme}
				<option value={theme.id}>{theme.label}</option>
			{/each}
		</select>
		{$termStore}
		<button type="button" class="variant-ghost btn-icon md:hidden" on:click={openModal}>
			<span class="material-symbols-outlined">palette</span>
		</button>
	</svelte:fragment>
</AppBar>
