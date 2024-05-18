<script lang="ts">
	let search = '';
	$: jsondata = [];
	async function searchCourses(search) {
		// const response = await fetch('/get.json');
		//http://localhost:5000/courses
		console.log(search);
		let query = search.replace(/\s/g, '').toUpperCase();
		// add a space between the course letters and numbers
		query = query.replace(/([a-zA-Z])([0-9])/g, '$1 $2');
		const response = await fetch('http://localhost:5000/courses?id=' + query);
		jsondata = await response.json();
		console.log(jsondata);
	}
</script>

<h3 class="h3 mt-3 text-center">Search</h3>
<!-- http://localhost:5000/courses -->
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
			<div class="card card-hover mx-3 max-h-8 overflow-x-scroll rounded-md px-3 py-1">
				<h5 class="card-title h5">
					{course._id}
				</h5>
			</div>
		{/each}
	</div>
{/if}
