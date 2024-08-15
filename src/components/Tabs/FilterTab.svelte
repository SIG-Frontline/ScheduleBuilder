<script lang="ts">
  import { onMount } from 'svelte';
  import { termSeason } from '$lib/termStore';
  import { filterStore, reset } from '$lib/filterStore';

	// // Variables for form inputs
	let subjects: {SUBJECT: string}[] = [];
	// let selectedSubjects = [];
	let isSubjectsCollapsed = true
  let isBuildingsCollapsed = true

	// let sectionStatus = 'Any';
	// let isHonors = 'Any';
	// let isAsync = 'Any';

	// let creditsMin = 0;
	// let creditsMax = 20;

	// let courseLevelMin = 0;
	// let courseLevelMax = 10;

	// let selectedSummerPeriods = [];
	let summerPeriods = [
		{ value: 1, label: '1 | First Session' },
		{ value: 2, label: '2 | Second Session' },
		{ value: 4, label: '4 | Full Session' }
	];

  let daysOfWeek = [
    {value: 'U', label:"U | Sunday"},
    {value: 'M', label:"M | Monday"},
    {value: 'T', label:"T | Tuesday"},
    {value: 'W', label:"W | Wednesday"},
    {value: 'R', label:"R | Thursday"},
    {value: 'F', label:"F | Friday"},
    {value: 'S', label:"S | Saturday"},
  ]

	let instructionMethods: {INSTRUCTION_METHOD: string}[] = [];
  let buildingOptions: {building: string}[] = []
	// let selectedInstructionMethods = [];

	// Fetch dynamic data for subjects and instruction methods
	onMount(async () => {
    subjects = await fetchSubjects();
    instructionMethods = await fetchInstructionMethods();
    buildingOptions = await fetchBuildings();
	});

  async function fetchBuildings() {
		let res = await fetch('/api/buildings')
			.then((res) => res.json())
		return res.buildings
	}

	// Example functions for fetching dynamic data
	async function fetchSubjects() {
		let res = await fetch('/api/subjects')
			.then((res) => res.json())
		return res.subjects
	}

	async function fetchInstructionMethods() {
		let res = await fetch('/api/instruction-methods')
			.then((res) => res.json())
		return res.methods
	}
</script>

<style>
	.small-icon {
	  font-size: 18px; /* Adjust size as needed */
	}
  </style>

<h3 class="h3 mt-3 text-center">Filters</h3>
<form class="flex flex-col space-y-4 px-4">

	<!-- Submit Button -->
  <button
    type="button"
    class="variant-soft-surface bg-surface-200-700-token btn !h-10 border-none"
    on:click={reset}>Reset Filters</button>

  <!-- Subject - Checkbox List, Collapsible -->
  <div>
    <label>
      <b>Subject</b>
      <span class="material-symbols-outlined small-icon" title="Select the subjects you are interested in.">info</span>
    </label>
    <button type="button" class="text-blue-500 underline" on:click={() => isSubjectsCollapsed = !isSubjectsCollapsed}>
      {isSubjectsCollapsed ? 'Show' : 'Hide'} Subjects
    </button>
    {#if !isSubjectsCollapsed}
      <div class="flex flex-col mt-2">
        {#each subjects as subject}
          <label>
            <input type="checkbox" bind:group={$filterStore.selectedSubjects} value={subject.SUBJECT} />
            {subject.SUBJECT}
          </label>
        {/each}
      </div>
    {/if}
  </div>

  <label>
    <b>Conflict Avoidance</b>
    <span class="material-symbols-outlined small-icon" title="Filter by whether a section conflicts with already planned blocks.">info</span>
  </label>
  <div>
    <label>
      <input type="radio" bind:group={$filterStore.avoidMode} value="None" /> None
    </label>
    <label>
      <input type="radio" bind:group={$filterStore.avoidMode} value="Sections" /> Avoid Planned Sections
    </label>
    <label>
      <input type="radio" bind:group={$filterStore.avoidMode} value="Events" /> Avoid Custom Events
    </label>
    <label>
      <input type="radio" bind:group={$filterStore.avoidMode} value="All" /> Avoid All
    </label>
  </div>

  <!-- Section Status - Radio -->
  <label>
    <b>Section Status</b>
    <span class="material-symbols-outlined small-icon" title="Filter by the status of sections.">info</span>
  </label>
  <div>
    <label>
      <input type="radio" bind:group={$filterStore.sectionStatus} value="Any" /> Any
    </label>
    <label>
      <input type="radio" bind:group={$filterStore.sectionStatus} value="Open" /> Open
    </label>
    <label>
      <input type="radio" bind:group={$filterStore.sectionStatus} value="Closed" /> Closed
    </label>
  </div>

  <!-- Is Honors - Radio -->
  <label>
    <b>Is Honors</b>
    <span class="material-symbols-outlined small-icon" title="Filter by honors courses.">info</span>
  </label>
  <div>
    <label>
      <input type="radio" bind:group={$filterStore.isHonors} value="Any" /> Any
    </label>
    <label>
      <input type="radio" bind:group={$filterStore.isHonors} value="Honors" /> Honors
    </label>
    <label>
      <input type="radio" bind:group={$filterStore.isHonors} value="Not Honors" /> Not Honors
    </label>
  </div>

  <!-- Is Async - Radio -->
  <label>
    <b>Is Async</b>
    <span class="material-symbols-outlined small-icon" title="Filter by asynchronous courses.">info</span>
  </label>
  <div>
    <label>
      <input type="radio" bind:group={$filterStore.isAsync} value="Any" /> Any
    </label>
    <label>
      <input type="radio" bind:group={$filterStore.isAsync} value="Async" /> Async
    </label>
    <label>
      <input type="radio" bind:group={$filterStore.isAsync} value="Not Async" /> Not Async
    </label>
  </div>

  <!-- Credits - Range Selection with Number Inputs -->
  <label>
    <b>Credits</b>
    <span class="material-symbols-outlined small-icon" title="Select the range of credits.">info</span>
  </label>
  <div class="flex items-center space-x-2">
    <input
      type="number"
      min="0"
      max="18"
      bind:value={$filterStore.creditsMin}
      class="input w-full"
      placeholder="Min"
    />
    <span>-</span>
    <input
      type="number"
      min="0"
      max="18"
      bind:value={$filterStore.creditsMax}
      class="input w-full"
      placeholder="Max"
    />
  </div>

  <!-- Course Level - Range Selection with Number Inputs -->
  <label>
    <b>Course Level</b>
    <span class="material-symbols-outlined small-icon" title="Select the range of course levels.">info</span>
  </label>
  <div class="flex items-center space-x-2">
    <input
      type="number"
      min="0"
      max="10"
      bind:value={$filterStore.courseLevelMin}
      class="input w-full"
      placeholder="Min"
    />
    <span>-</span>
    <input
      type="number"
      min="0"
      max="10"
      bind:value={$filterStore.courseLevelMax}
      class="input w-full"
      placeholder="Max"
    />
  </div>

  <!-- Summer Period - Checkbox List -->
{#if $termSeason === 'Summer'}
  <label>
    <b>Summer Period</b>
    <span class="material-symbols-outlined small-icon" title="Select the summer session.">info</span>
  </label>
  <div class="flex flex-col">
    {#each summerPeriods as period}
      <label>
        <input type="checkbox" bind:group={$filterStore.selectedSummerPeriods} value={period.value} />
        {period.label}
      </label>
    {/each}
  </div>
{/if}

<label>
  <b>Day of Week</b>
  <span class="material-symbols-outlined small-icon" title="Select the day of week.">info</span>
</label>
<div class="flex flex-col">
  {#each daysOfWeek as dow}
    <label>
      <input type="checkbox" bind:group={$filterStore.selectedDays} value={dow.value} />
      {dow.label}
    </label>
  {/each}
</div>

  <!-- Instruction Method - Checkbox List -->
  <label>
    <b>Instruction Method</b>
    <span class="material-symbols-outlined small-icon" title="Select the instruction methods.">info</span>
  </label>
  <div class="flex flex-col">
    {#each instructionMethods as method}
      <label>
        <input type="checkbox" bind:group={$filterStore.selectedInstructionMethods} value={method.INSTRUCTION_METHOD} />
        {method.INSTRUCTION_METHOD}
      </label>
    {/each}
  </div>  

  <div>
    <label>
      <b>Exclude Buildings</b>
      <span class="material-symbols-outlined small-icon" title="You can choose to exclude certain buildings from your search.">info</span>
    </label>
    <button type="button" class="text-blue-500 underline" on:click={() => isBuildingsCollapsed = !isBuildingsCollapsed}>
      {isBuildingsCollapsed ? 'Show' : 'Hide'} Buildings
    </button>
    {#if !isBuildingsCollapsed}
      <div class="flex flex-col mt-2">
        {#each buildingOptions as subject}
          <label>
            <input type="checkbox" bind:group={$filterStore.excludedBuildings} value={subject.building} />
            {subject.building}
          </label>
        {/each}
      </div>
    {/if}
  </div>
</form>