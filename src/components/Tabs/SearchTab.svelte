<script lang="ts">
	import { termStore } from '$lib/termStore';

	let search = '';
	$: jsondata = [];
	async function searchCourses(search) {
		let query = search.replace(/\s/g, ''); // remove spaces from the query
		query = query.replace(/([a-zA-Z])([0-9])/g, '$1 $2'); // add a space between the course letters and numbers
		const response = await fetch('http://localhost:5173/api/courses?id=' + query);
		jsondata = await response.json();
	}
	async function getSections(course) {
		let query = course;
		if ($termStore !== -1) {
			// if the term is set, add it to the query
			query += '&term=' + $termStore;
		}
		const response = await fetch('http://localhost:5173/api/sections?course=' + query);
		let resdata = await response.json();
	}
</script>

<h3 class="h3 mt-3 text-center">Search</h3>
<input
	class="input"
	title="Search (courses)"
	type="text"
	placeholder="Search (courses)"
	bind:value={search}
	on:input={() => searchCourses(search)}
/>
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
