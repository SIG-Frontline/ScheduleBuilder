<script lang="ts">
	// Importing necessary modules and components
	import { onMount } from 'svelte';
	import CourseSection from './CourseSection.svelte';
	import { planStore } from '$lib/planStore';

	// Initialize start and end times for the calendar
	let startDate = new Date(2000, 0, 1, 7, 0, 0); // 7:00am
	let endDate = new Date(2000, 0, 1, 22, 0, 0); // 10:00pm

	// Array to store generated dates
	let dates: Date[] = [];

	// Function to generate dates every 30 minutes between start and end times
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
	let daysOfWeek = new Array(7).fill(0).map((_, i) => {
		let date = new Date(2000, 0, i + 2);
		return date.toLocaleDateString('en-us', { weekday: 'long' });
	});

	// Variables for layout calculation
	let dayWidth = 0;
	let timeColWidth = 0;
	let timeCol: HTMLDivElement;
	let firstRowDivMarker: HTMLDivElement;
	let secondRowDivMarker: HTMLDivElement;
	let hourHeight = 0;

	// Calculate the height of an hour on the calendar grid
	onMount(() => {
		hourHeight =
			(secondRowDivMarker?.getBoundingClientRect().y -
				firstRowDivMarker?.getBoundingClientRect().y) *
			2;
	});

	// Variables for grid resizing
	let updateCourses: number;
	function resiseGrid(event: WheelEvent) {
		clearTimeout(updateCourses);
		if (event.deltaY > 0) {
			gridheight += 100;
		} else {
			gridheight -= 100;
		}
		updateCourses = setTimeout(() => {
			hourHeight =
				(secondRowDivMarker?.getBoundingClientRect().y -
					firstRowDivMarker?.getBoundingClientRect().y) *
				2;
		}, 0) as unknown as number;
	}
	let gridheight = 1000;
</script>

<!-- Handle wheel event for grid resizing -->
<svelte:window
	on:wheel|passive|capture|stopPropagation={(e) => {
		if (e.shiftKey) resiseGrid(e);
	}}
/>

<!-- Display the days of the week -->
<div
	class="align-center bg-surface-50-900-token sticky top-0 z-30 flex w-[200vw] flex-row pt-5 lg:w-full"
>
	<p
		class="bg-surface-50-900-token sticky left-0 z-30 flex-[.5] text-center"
		bind:clientWidth={timeColWidth}
	>
		Time
	</p>
	{#each daysOfWeek as day}
		<p class="flex-1 text-center" bind:clientWidth={dayWidth}>{day}</p>
	{/each}
</div>

<!-- Display the generated dates -->
<div
	class="relative mt-5 flex w-[200vw] flex-col justify-between lg:w-full"
	bind:this={timeCol}
	style:height={gridheight + 'px'}
>
	{#each dates as date, i}
		<span class="relative flex h-0 items-center justify-center">
			{#if i % 2 === 0}
				<p
					class="md:text-md card sticky left-0 z-20 ml-1 mr-1 flex h-fit !w-20 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs"
					style:width={timeColWidth + 'px'}
				>
					{date.toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })}
					<!-- format the date as a time like 6:00am -->
				</p>
			{/if}
			{#if i === 0}
				<div
					class="absolute left-0 top-0 h-0 w-0 bg-transparent"
					bind:this={firstRowDivMarker}
				></div>
			{:else if i === 1}
				<div
					class="absolute left-0 top-0 h-0 w-0 bg-transparent"
					bind:this={secondRowDivMarker}
				></div>
			{/if}
			<hr
				class={i % 2 === 0
					? 'md:w-[95% ml-[5%] w-[95%] !border-t-2 !border-solid md:ml-[4%]'
					: 'md:w-[95% ml-[5%] w-[95%] !border-t-2 !border-dashed md:ml-[4%]'}
			/>
		</span>
	{/each}

	<!-- Display course sections -->
	<!-- <CourseSection
		top={hourHeight}
		left={timeColWidth + dayWidth * 2}
		width={dayWidth - 10}
		height={hourHeight}
		color="!bg-red-300"
	>
		<p class="text-center !text-gray-700">Course 1</p>
	</CourseSection>
	<CourseSection
		top={hourHeight}
		left={timeColWidth + dayWidth * 4}
		width={dayWidth - 10}
		height={hourHeight}
		color="!bg-red-300"
	>
		<p class="text-center !text-gray-700">Course 1</p>
	</CourseSection>
	<CourseSection
		top={hourHeight}
		left={timeColWidth + dayWidth * 3}
		width={dayWidth - 10}
		height={hourHeight}
		color="!bg-blue-300"
	>
		<p class="text-center !text-gray-700">Course 2</p>
	</CourseSection>
	<CourseSection
		top={hourHeight}
		left={timeColWidth + dayWidth * 5}
		width={dayWidth - 10}
		height={hourHeight}
		color="!bg-blue-300"
	>
		<p class="text-center !text-gray-700">Course 2</p>
	</CourseSection> -->
	{#if $planStore.length > 0}
		{@const activePlan = $planStore.find((p) => p.active)}
		{#if activePlan}
			{#each activePlan.courses as course}
				{#each course.sections as section}
					{#if section.selected}
						{#each section.TIMES as meeting}
							<CourseSection
								top={hourHeight *
									(new Date(meeting.start).getHours() - new Date(startDate).getHours() + 5) +
									(new Date(meeting.start).getMinutes() / 60) * hourHeight}
								left={timeColWidth +
									dayWidth * ['U', 'M', 'T', 'W', 'R', 'F', 'S'].indexOf(meeting.day)}
								width={dayWidth - 10}
								height={(hourHeight *
									(new Date(meeting.end).getTime() - new Date(meeting.start).getTime())) /
									(1000 * 60 * 60)}
								color="!bg-red-300"
							>
								<p class="text-center !text-gray-700">
									{section.COURSE}
									<br />
									{meeting.building}
									{meeting.room}
								</p>
							</CourseSection>
						{/each}
					{/if}
				{/each}
			{/each}
		{/if}
	{/if}
</div>
