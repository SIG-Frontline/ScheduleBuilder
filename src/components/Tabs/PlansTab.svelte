<script>
	import { planStore } from '$lib/planStore';
	import { termStore, humanReadableTerm } from '$lib/termStore';
	import { uuidv4 } from '$lib/uuidv4';

	let name = '';
	function addPlan() {
		if (name === '') return;
		//remove active from all other plans
		planStore.update((plans) => {
			plans.forEach((p) => (p.active = false));
			return plans;
		});

		planStore.update((plans) => {
			return (
				plans.push({ id: uuidv4(), name: name, term: $termStore, active: true, courses: [] }), plans
			);
		});
		name = '';
	}
	function removePlan(id) {
		if (confirm('Are you sure you want to delete this plan?')) {
			planStore.update((plans) => plans.filter((p) => p.id !== id));
		}
	}
	function renamePlan(id) {
		let newName = prompt('Enter new name for the plan', name);
		planStore.update((plans) => {
			const plan = plans.find((p) => p.id === id);
			plan.name = newName;
			return plans;
		});
	}
	function selectPlan(id) {
		planStore.update((plans) => {
			plans.forEach((p) => (p.active = p.id === id));
			return plans;
		});
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
	<ul class="list">
		{#each $planStore as plan, i}
			<li
				class="m-3 list-item !rounded-lg hover:bg-surface-300-600-token {plan.active
					? 'bg-surface-200-700-token'
					: ''}
                    transition-colors duration-200 ease-in-out"
			>
				<button on:click={() => selectPlan(plan.id)} class="flex !w-full items-center p-3">
					<span class="variant-soft-primary badge-icon p-4">{i + 1}</span>
					<span class="flex-auto">{plan.name}</span>
					<button
						class="material-symbols-outlined btn-icon hover:variant-ghost-success"
						on:click={() => renamePlan(plan.id)}>edit</button
					>
					<button
						on:click={() => removePlan(plan.id)}
						class="material-symbols-outlined btn-icon hover:variant-ghost-error">delete</button
					>
				</button>
			</li>
		{/each}
	</ul>
{:else}
	<p>No plans added yet</p>
{/if}
