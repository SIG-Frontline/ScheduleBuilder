<script lang="ts">
	let startDate = new Date(2000, 0, 1, 7, 0, 0);
	let endDate = new Date(2000, 0, 1, 22, 0, 0);
	let dates: Date[] = [];
	function generateDates() {
		let currentDate = new Date(startDate);
		while (currentDate < endDate) {
			dates.push(new Date(currentDate));
			currentDate.setMinutes(currentDate.getMinutes() + 30);
		}
	}
	generateDates();
	let daysOfWeek = new Array(6).fill(0).map((_, i) => {
		let date = new Date(2000, 0, i + 3);
		return date.toLocaleDateString('en-us', { weekday: 'long' });
	});
</script>

<div
	class="align-center sticky top-0 z-30 flex w-[200vw] flex-row justify-evenly bg-surface-50 pt-5 lg:w-full"
>
	{#each daysOfWeek as day}
		<p class="text-center">{day}</p>
	{/each}
</div>
<div class="flex w-[200vw] flex-col lg:w-full">
	{#each dates as date, i}
		{#if i % 2 === 0}
			<p
				class="text-cente ml-1 mr-1 flex h-10 w-20 translate-y-1/2 transform items-center justify-center bg-surface-50"
			>
				{date.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}
				<!-- format the date as a time like 6:00am -->
			</p>
		{:else}
			<p class="h-10"></p>
		{/if}
		<hr
			class="ml-[5%] h-[2px] w-[90%] bg-black md:ml-[4%] md:w-[95%] {i % 2 === 0
				? ''
				: 'opacity-25'}"
		/>
	{/each}
</div>
