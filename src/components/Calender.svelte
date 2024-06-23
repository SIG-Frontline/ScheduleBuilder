<script lang="ts">
	// Importing necessary modules and components
	import { onMount } from 'svelte';
	import CourseSection from './CourseSection.svelte';
	import { planStore } from '$lib/planStore';
	import { getActivePlan } from '$lib/getActivePlan';
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
	function gencolor(i: number) {
		let colorarr = [
			'!bg-red-300',
			'!bg-blue-300',
			'!bg-green-300',
			'!bg-yellow-300',
			'!bg-purple-300',
			'!bg-pink-300',
			'!bg-indigo-300',
			'!bg-cyan-300',
			'!bg-teal-300',
			'!bg-lime-300',
			'!bg-amber-300',
			'!bg-orange-300'
		];
		if (i >= colorarr.length) {
			i = i - colorarr.length;
		}
		let returnval = colorarr[i % colorarr.length];
		return returnval;
	}

	// Function used to get radial degree
	function roundPercent(now: number, max: number) {
		const temp = Math.ceil(((now / max) * 100) / 5) * 5;
		console.log(temp);
		if (temp >= 100) return 100;
		return temp;
	}

	// Function to convert time to localTime
	function getLocal(time: any) {
		if (!time) {
			return 'TBD';
		}
		return new Date(
			new Date(time).getTime() + startDate.getTimezoneOffset() * 60000
		).toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' });
	}
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
	{#if $planStore.length > 0}
		{@const activePlan = getActivePlan($planStore)}
		{#if activePlan}
			{#each activePlan.courses as course, i}
				{#each course.sections as section}
					{#if section.SECTION === course.selectedSection}
						{#each section.TIMES as meeting}
							{@const tempPercent = roundPercent(section.NOW, section.MAX)}
							{@const fullName = `${section.COURSE ?? 'N/A'}-${section.SECTION ?? 'N/A'}: ${section.TITLE ?? 'N/A'}`}
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
								color={gencolor(i)}
								course={fullName}
							>
								<div class="relative h-[calc(100%-20px)]">
									<div
										class="absolute -right-5 -top-3 rounded-3xl p-0.5"
										style="background-image: conic-gradient({tempPercent < 75
											? 'LimeGreen'
											: tempPercent < 85
												? 'Orange'
												: 'Red'} {tempPercent}%, gray {tempPercent}%, gray);"
									>
										<div class="rounded-[calc(1.5rem-1px)] bg-white px-1 dark:bg-slate-200">
											<p class="text-xs !text-gray-700">
												{`${section.NOW ?? '??'}/${section.MAX ?? '??'}`}
											</p>
										</div>
									</div>

									<p
										class="mx-1.5 truncate rounded-lg border border-slate-400 bg-slate-200 px-0.5 text-left text-xs !text-gray-700"
									>
										{fullName}
									</p>
									<div
										class="hide-scrollbar relative mx-1.5 my-0.5 h-full flex-col overflow-y-auto overflow-x-hidden"
									>
										<!-- Timing/Location -->
										<div class="flex flex-1 flex-col">
											<!-- Location -->
											<div class="flex flex-1 shrink">
												<span
													class="material-symbols-outlined !text-gray-700"
													style="font-size: medium;"
												>
													location_on
												</span>
												<p class="flex-0.5 text-left text-xs !text-gray-700">
													{`${meeting.building ?? 'TBD'} ${meeting.room ?? 'TBD'}`}
												</p>
											</div>
											<!-- Instructor -->
											<div class="flex">
												<span
													class="material-symbols-outlined align-middle !text-gray-700"
													style="font-size: medium;">person</span
												>
												<p class="text-left text-xs !text-gray-700">
													{section.INSTRUCTOR ?? 'TBD'}
												</p>
											</div>
											<!-- CRN -->
											<div class="flex shrink">
												<span
													class="material-symbols-outlined !text-gray-700"
													style="font-size: medium;">numbers</span
												>
												<p class="text-left text-xs !text-gray-700">
													{section.CRN ?? 'TBD'}
												</p>
											</div>

											<!-- Timing -->
											<div class="flex">
												<span
													class="material-symbols-outlined !text-gray-700"
													style="font-size: medium;">nest_clock_farsight_analog</span
												>
												<p class=" text-left text-xs !text-gray-700">
													{getLocal(meeting.start)} - {getLocal(meeting.end)}
												</p>
											</div>
										</div>
									</div>
								</div>
							</CourseSection>
						{/each}
					{/if}
				{/each}
			{/each}
		{/if}
	{/if}
</div>
