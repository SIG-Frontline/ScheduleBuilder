<script lang="ts">
	// Initialize start and end dates
	let startDate = new Date(2000, 0, 1, 7, 0, 0); // 7:00am
	let endDate = new Date(2000, 0, 1, 22, 0, 0); // 10:00pm

	// Array to store generated dates
	let dates: Date[] = [];

	// Function to generate dates every 30 minutes between start and end dates
	function generateDates() {
		let currentDate = new Date(startDate);
		while (currentDate < endDate) {
			dates.push(new Date(currentDate));
			currentDate.setMinutes(currentDate.getMinutes() + 30);
		}
	}

	// Call the function to generate dates
	generateDates();

	// Generate an array of days of the week
	let daysOfWeek = new Array(6).fill(0).map((_, i) => {
		let date = new Date(2000, 0, i + 3);
		return date.toLocaleDateString('en-us', { weekday: 'long' });
	});
</script>

<!-- Display the days of the week -->
<div
	class="align-center sticky top-0 z-30 flex w-[200vw] flex-row justify-evenly bg-surface-50 pt-5 lg:w-full"
>
	{#each daysOfWeek as day}
		<p class="text-center">{day}</p>
	{/each}
</div>

<!-- Display the generated dates -->
<div class="flex w-[200vw] flex-col lg:w-full">
	{#each dates as date, i}
		{#if i % 2 === 0}
			<p
				class="text-cente sticky left-0 z-20 ml-1 mr-1 flex h-10 w-20 translate-y-1/2 transform items-center justify-center bg-surface-50"
			>
				{date.toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })}
				<!-- format the date as a time like 6:00am -->
			</p>
		{:else}
			<p class="h-10"></p>
		{/if}
		<hr
			class="ml-[5%] h-[2px] w-[95%] bg-black md:ml-[4%] md:w-[95%] {i % 2 === 0
				? ''
				: 'opacity-25'}"
		/>
	{/each}
</div>
