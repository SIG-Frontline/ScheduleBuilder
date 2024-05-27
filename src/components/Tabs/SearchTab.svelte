<script lang="ts">
	import { planStore } from '$lib/planStore';
	import { termStore } from '$lib/termStore';
	import { uuidv4 } from '$lib/uuidv4';
	import {
		Accordion,
		AccordionItem,
		Autocomplete,
		type AutocompleteOption
	} from '@skeletonlabs/skeleton';

	let search = '';
	interface Course {
		_id: string;
		sections: { section: string; selected: boolean }[];
	}
	interface Plan {
		active: boolean;
		courses: Course[];
		term: string;
		id: string;
		name: string;
	}
	interface PlanStore {
		plans: Plan[];
	}
	$: jsondata = {} as Plan;
	let firstMinoftoday = new Date();
	firstMinoftoday.setHours(0, 0, 0, 0);
	async function searchCourses(searchval: string) {
		let query = searchval.replace(/\s/g, ''); // remove spaces from the query
		query = query.replace(/([a-zA-Z])([0-9])/gi, '$1 $2'); // add a space between the course letters and numbers
		autocompleteOptions = await fetch(
			'http://localhost:5173/api/courses?course=' + query + '&term=' + $termStore
		)
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				const coursearr = data.courses;
				return coursearr.map((course: any) => {
					return {
						label: course._id,
						value: course._id,
						meta: course.sections
					};
				});
			});
	}
	function selectSection(course: string, section: string) {
		planStore.update((plans) => {
			//mark the section as selected and unselect all other sections in that course
			let activePlan = plans.find((p: { active: boolean }) => p.active);
			if (!activePlan) {
				plans.push({
					active: true,
					courses: [
						{
							course: course,
							sections: [{ section: section, selected: true }],
							id: uuidv4(),
							name: `Plan ${plans.length + 1}`
						}
					],
					term: $termStore
				});
				console.log(plans);
			} else {
				let courseIndex = activePlan.courses.findIndex(
					(c: { course: string; sections: { section: string; selected: boolean }[] }) =>
						c.course === course
				);
				console.log(courseIndex);
				activePlan.courses[courseIndex].sections.forEach(
					(s: { selected: boolean }) => (s.selected = false)
				);
				let sectionIndex = activePlan.courses[courseIndex].sections.findIndex(
					(s: string) => s === section
				);
				console.log(sectionIndex);
				activePlan.courses[courseIndex].sections[sectionIndex].selected = true;
			}
			return plans;
		});
	}
	async function onSelection(event: CustomEvent<AutocompleteOption<string>>): Promise<void> {
		const sections = event.detail.meta;
		const course = event.detail.value;
		planStore.update((plans) => {
			let activePlan = plans.find((p: { active: boolean }) => p.active);
			if (!activePlan) {
				plans.push({
					active: true,
					courses: [{ course: course, sections: sections }],
					term: $termStore,
					id: uuidv4(),
					name: `Plan ${plans.length + 1}`
				});
			} else {
				let courseIndex = activePlan.courses.findIndex(
					(c: { course: string; sections: any[] }) => c.course === course
				);
				if (courseIndex !== -1) {
					activePlan.courses = activePlan.courses.filter(
						(c: { course: string }) => c.course !== course
					);
				}
				activePlan.courses.push({ course: course, sections: sections });
			}
			return plans;
		});
		search = '';
		autocompleteOptions = [];
	}

	let autocompleteOptions: AutocompleteOption<string>[] = [];
	function onInput(e: any) {
		e.target.value = e?.target?.value.toUpperCase().replace(/\s/g, '');
		e.target.value = e?.target?.value.replace(/([a-zA-Z])([0-9])/gi, '$1 $2');
		searchCourses(search);
	}
</script>

<h3 class="h3 mt-3 text-center">Search</h3>
<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
	<div class="input-group-shim"><span class="material-symbols-outlined">search</span></div>
	<input
		type="search"
		name="demo"
		class="input !max-w-1"
		on:input={onInput}
		bind:value={search}
		placeholder="Search..."
	/>
</div>

<div class="card max-h-48 w-full max-w-sm overflow-y-auto p-4" tabindex="-1">
	<Autocomplete bind:input={search} options={autocompleteOptions} on:selection={onSelection} />
</div>

{#if jsondata?.courses?.length > 0}
	<div class="row mt-[2px]">
		{#each jsondata?.courses as course}
			<button class="card card-hover mx-3 max-h-8 w-10/12 overflow-x-scroll rounded-md px-3 py-1">
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
