<script lang="ts">
	import { planStore } from '$lib/stores/planStore';
	import { termStore, humanReadableTerm } from '$lib/stores/termStore';
	import { uuidv4 } from '$lib/util/uuidv4';
	import { ListBox, ListBoxItem, popup } from '@skeletonlabs/skeleton';

	let name = '';
	let menu = [
		{
			label: 'Rename',
			icon: 'edit',
			action: (id: string) => renamePlan(id)
		},
		{
			label: 'Delete',
			icon: 'delete',
			action: (id: string) => removePlan(id)
		}
	];

	function addPlan() {
		if (name === '') return;
		//remove active from all other plans
		planStore.update((plans) => {
			plans.forEach((p: { active: boolean }) => (p.active = false));
			return plans;
		});

		planStore.update((plans) => {
			return (
				plans.push({
					id: uuidv4(),
					name: name,
					term: $termStore,
					courses: [],
					group: 1
				}),
				plans
			);
		});
		name = '';
	}
	function removePlan(id: string) {
		if (confirm('Are you sure you want to delete this plan?')) {
			planStore.update((plans) => plans.filter((p: { id: string }) => p.id !== id));
		}
	}
	function renamePlan(id: string) {
		//get old plan name
		let { name } = $planStore.find((p: { id: string }) => p.id === id);

		let newName = prompt('Enter new name for the plan', name);
		planStore.update((plans) => {
			const plan = plans.find((p: { id: string }) => p.id === id);
			plan.name = newName;
			return plans;
		});
	}

	let activePlan = $planStore.find((p: { active: boolean }) => p.active)?.name || '';
	//sync up the store with the active plan when it changes
	$: {
		planStore.update((plans) => {
			plans.forEach((p: { active: boolean; name: string }) => (p.active = p.name === activePlan));
			return plans;
		});
	}
	function setActivePlan(event: Event) {
		activePlan = (event.target as HTMLInputElement).value;
	}
</script>

<h3 class="h3 mt-3 text-center">Plans</h3>
<form class="flex items-center" on:submit|preventDefault={addPlan}>
	<label class="label !h-10" for="plan-name">
		<span class="sr-only">Plan Name</span>
	</label>

	<input
		type="text"
		class="input !m-0 border-none"
		id="plan-name"
		bind:value={name}
		placeholder="Enter Plan Name"
	/>
	<button
		type="button"
		class="variant-soft-surface bg-surface-200-700-token btn !h-10 border-none"
		on:click={addPlan}>Add Plan</button
	>
</form>
<p>Selected Term: {$humanReadableTerm}</p>

{#if $planStore.length > 0}
	<ListBox>
		{#each $planStore as plan, i}
			<ListBoxItem
				on:change={setActivePlan}
				bind:group={activePlan}
				value={plan.name}
				name={'plan'}
				active={'bg-surface-200-700-token shadow-md border-solid border-[1px] border-surface-200-700-token'}
				regionDefault="flex flex-row justify-between"
				class="m-3 !rounded-lg transition-colors duration-200 ease-in-out hover:bg-surface-300-600-token"
			>
				<svelte:fragment slot="lead">
					<span class="variant-soft-primary badge-icon p-4">{i + 1}</span>
				</svelte:fragment>

				<span class="mx-auto">{plan.name}</span>

				<svelte:fragment slot="trail">
					<button
						class=" variant-soft btn-icon btn-icon-sm"
						use:popup={{
							event: 'click',
							target: 'popup-menu-' + i,
							placement: 'left'
						}}
						><span class="material-symbols-outlined">more_vert</span>
						<div
							data-popup="popup-menu-{i}"
							class="card bg-surface-800-100-token flex w-32 flex-col items-center justify-center !rounded-lg text-surface-900 shadow-lg"
						>
							{#each menu as item}
								<button
									class=" my-2 flex w-full items-center p-2 hover:bg-surface-300"
									on:click={() => item.action(plan.id)}
								>
									<span class="material-symbols-outlined !mr-2">{item.icon}</span>
									<span>{item.label}</span>
								</button>
							{/each}
						</div>
					</button>
				</svelte:fragment>
			</ListBoxItem>
		{/each}
	</ListBox>
{:else}
	<p>No plans added yet</p>
{/if}
