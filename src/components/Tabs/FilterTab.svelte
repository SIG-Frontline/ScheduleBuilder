<script lang="ts">
  import { onMount } from 'svelte';
  import { termSeason } from '$lib/termStore';

	// Variables for form inputs
	let subjects = [];
	let selectedSubjects = [];
	let isSubjectsCollapsed = true

	let sectionStatus = 'Any';
	let isHonors = 'Any';
	let isAsync = 'Any';

	let creditsMin = 0;
	let creditsMax = 20;

	let courseLevelMin = 0;
	let courseLevelMax = 10;

	let selectedSummerPeriods = [];
	let summerPeriods = [
		{ value: 1, label: '1 | First Session' },
		{ value: 2, label: '2 | Second Session' },
		{ value: 4, label: '4 | Full Session' }
	];

	let instructionMethods: string[] = [];
	let selectedInstructionMethods = [];

	// Fetch dynamic data for subjects and instruction methods
	onMount(async () => {
	// Fetch subjects dynamically
	subjects = await fetchSubjects();

	// Fetch instruction methods dynamically
	instructionMethods = await fetchInstructionMethods();
	});

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

	function addPlan() {
	// Handle form submission logic here
	}
</script>

<style>
	.small-icon {
	  font-size: 18px; /* Adjust size as needed */
	}
  </style>

<h3 class="h3 mt-3 text-center">Filters</h3>
<form class="flex flex-col space-y-4 px-4" on:submit|preventDefault={addPlan}>

	<!-- Submit Button -->
  <button
    type="button"
    class="variant-soft-surface bg-surface-200-700-token btn !h-10 border-none"
    on:click={addPlan}>Update Filters</button>

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
            <input type="checkbox" bind:group={selectedSubjects} value={subject.SUBJECT} />
            {subject.SUBJECT}
          </label>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Section Status - Radio -->
  <label>
    <b>Section Status</b>
    <span class="material-symbols-outlined small-icon" title="Filter by the status of sections.">info</span>
  </label>
  <div>
    <label>
      <input type="radio" bind:group={sectionStatus} value="Any" /> Any
    </label>
    <label>
      <input type="radio" bind:group={sectionStatus} value="Open" /> Open
    </label>
    <label>
      <input type="radio" bind:group={sectionStatus} value="Closed" /> Closed
    </label>
  </div>

  <!-- Is Honors - Radio -->
  <label>
    <b>Is Honors</b>
    <span class="material-symbols-outlined small-icon" title="Filter by honors courses.">info</span>
  </label>
  <div>
    <label>
      <input type="radio" bind:group={isHonors} value="Any" /> Any
    </label>
    <label>
      <input type="radio" bind:group={isHonors} value="Honors" /> Honors
    </label>
    <label>
      <input type="radio" bind:group={isHonors} value="Not Honors" /> Not Honors
    </label>
  </div>

  <!-- Is Async - Radio -->
  <label>
    <b>Is Async</b>
    <span class="material-symbols-outlined small-icon" title="Filter by asynchronous courses.">info</span>
  </label>
  <div>
    <label>
      <input type="radio" bind:group={isAsync} value="Any" /> Any
    </label>
    <label>
      <input type="radio" bind:group={isAsync} value="Async" /> Async
    </label>
    <label>
      <input type="radio" bind:group={isAsync} value="Not Async" /> Not Async
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
      bind:value={creditsMin}
      class="input w-full"
      placeholder="Min"
    />
    <span>-</span>
    <input
      type="number"
      min="0"
      max="18"
      bind:value={creditsMax}
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
      bind:value={courseLevelMin}
      class="input w-full"
      placeholder="Min"
    />
    <span>-</span>
    <input
      type="number"
      min="0"
      max="10"
      bind:value={courseLevelMax}
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
        <input type="checkbox" bind:group={selectedSummerPeriods} value={period.value} />
        {period.label}
      </label>
    {/each}
  </div>
{/if}


  <!-- Instruction Method - Checkbox List -->
  <label>
    <b>Instruction Method</b>
    <span class="material-symbols-outlined small-icon" title="Select the instruction methods.">info</span>
  </label>
  <div class="flex flex-col">
    {#each instructionMethods as method}
      <label>
        <input type="checkbox" bind:group={selectedInstructionMethods} value={method.INSTRUCTION_METHOD} />
        {method.INSTRUCTION_METHOD}
      </label>
    {/each}
  </div>  
</form>