<script lang="ts">
	import { planStore } from '$lib/planStore';
	import { termStore } from '$lib/termStore';
	import {
		Accordion,
		AccordionItem,
		Autocomplete,
		ProgressBar,
		type AutocompleteOption
	} from '@skeletonlabs/skeleton';

	let search = '';
	$: jsondata = [];
	async function searchCourses(searchval) {
		let query = searchval.replace(/\s/g, ''); // remove spaces from the query
		query = query.replace(/([a-zA-Z])([0-9])/gi, '$1 $2'); // add a space between the course letters and numbers
		autocompleteOptions = await fetch(
			'http://localhost:5173/api/courses?id=' + query + '&term=' + $termStore
		)
			.then((res) => res.json())
			.then((data) => {
				console.log(data);

				return data.courses.map((course) => {
					return {
						label: course._id,
						value: course._id,
						keywords: course.description.split(' ').join(', '),
						meta: course
					};
				});
			});
	}
	async function getSections(course) {
		let query = course;
		if ($termStore !== -1) {
			// if the term is set, add it to the query
			query += '&term=' + $termStore;
		}
		const response = await fetch('http://localhost:5173/api/sections?course=' + query);
		let resdata = await response.json();
		planStore.update((plans) => {
			let activePlan = plans.find((p) => p.active);
			//if course is already in the plan,remove it
			if (activePlan) {
				let courseIndex = activePlan.courses.findIndex((c) => c.course === course);
				if (courseIndex !== -1) {
					activePlan.courses = activePlan.courses.filter((c) => c.course !== course);
				}
				activePlan.courses.push({ course: course, sections: resdata.courses });
			}

			return plans;
		});
		search = '';
		autocompleteOptions = [];
	}
	let firstMinoftoday = new Date();
	firstMinoftoday.setHours(0, 0, 0, 0);
	function selectSection(course, section) {
		planStore.update((plans) => {
			//mark the section as selected and unselect all other sections in that course
			let activePlan = plans.find((p) => p.active);
			console.log(activePlan);
			if (activePlan) {
				let courseIndex = activePlan.courses.findIndex((c) => c.course === course);
				console.log(courseIndex);
				activePlan.courses[courseIndex].sections.forEach((s) => (s.selected = false));
				let sectionIndex = activePlan.courses[courseIndex].sections.findIndex((s) => s === section);
				console.log(sectionIndex);
				activePlan.courses[courseIndex].sections[sectionIndex].selected = true;
			}
			return plans;
		});
	}

	async function onFlavorSelection(event: CustomEvent<AutocompleteOption<string>>): void {
		search = event.detail.label;
		console.log(event.detail.meta);

		getSections(event.detail.meta._id);
	}

	let autocompleteOptions: AutocompleteOption<string>[] = [];
</script>

<h3 class="h3 mt-3 text-center">Search</h3>
<!-- <input
	class="input"
	title="Search (courses)"
	type="text"
	placeholder="Search (courses)"
	bind:value={search}
	on:input={() => searchCourses(search)}
/> -->

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
	<div class="input-group-shim"><span class="material-symbols-outlined">search</span></div>
	<input
		type="search"
		name="demo"
		class="input !max-w-1"
		on:input={(e) => {
			e.target.value = e.target.value.toUpperCase().replace(/\s/g, '');
			e.target.value = e.target.value.replace(/([a-zA-Z])([0-9])/gi, '$1 $2');
			searchCourses(search);
		}}
		bind:value={search}
		placeholder="Search..."
	/>
</div>

<div class="card max-h-48 w-full max-w-sm overflow-y-auto p-4" tabindex="-1">
	<Autocomplete
		bind:input={search}
		options={autocompleteOptions}
		on:selection={onFlavorSelection}
	/>
</div>

{#if jsondata?.courses?.length > 0}
	<div class="row mt-[2px]">
		{#each jsondata?.courses as course}
			<button
				class="card card-hover mx-3 max-h-8 w-10/12 overflow-x-scroll rounded-md px-3 py-1"
				on:click={() => getSections(course._id)}
			>
				<h5 class="card-title h5">
					{course._id}
				</h5>
			</button>
		{/each}
	</div>
{/if}

{#if $planStore.length > 0}
	{@const activePlan = $planStore.find((p) => p.active)}
	{#if activePlan}
		<Accordion>
			{#each activePlan.courses as course}
				<AccordionItem>
					<svelte:fragment slot="summary">
						{course.course}
					</svelte:fragment>
					<svelte:fragment slot="content">
						{#each course.sections as section}
							<label class="flex items-center space-x-2">
								<input
									class="radio"
									type="radio"
									name="radio-{section.COURSE}"
									value={section.SECTION}
									on:change={() => selectSection(course.course, section)}
								/>
								<span>{section.COURSE}-{section.SECTION}, {section.INSTRUCTOR ?? 'TBA'}</span>
							</label>
						{/each}
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	{/if}
{/if}
