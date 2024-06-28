<!--Async Section -->
<script lang="ts">
	import AsyncCourseSection from './AsyncCourseSection.svelte';
	import { planStore } from '$lib/planStore';

	// Variables for layout calculation
	let dayWidth = 0;
	let timeColWidth = 0;
	let timeCol: HTMLDivElement;
	let firstRowDivMarker: HTMLDivElement;
	let secondRowDivMarker: HTMLDivElement;
	let hourHeight = 0;

	// Initialize start and end times for the calendar
	let startDate = new Date(2000, 0, 1, 7, 0, 0); // 7:00am
	let endDate = new Date(2000, 0, 1, 22, 0, 0); // 10:00pm

	let async_open = true;
	let async_container = null;

	function toggleAsync() {
		async_open = !async_open;
	}

	$: {
		if (async_container) {
			if (async_open) {
				async_container.classList.add('async-div-open');
				console.log('open');
			} else {
				async_container.classList.remove('async-div-open');
				console.log('close');
			}
		}
	}

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
</script>

<div
	bind:this={async_container}
	class="async-div async-div-open align-center fixed bottom-0 z-30 flex w-[200vw] flex-row border-surface-500 bg-surface-700 pt-5 lg:w-full"
>
	<button class="async-button absolute z-30" on:click={toggleAsync}>
		<span class="material-symbols-rounded">keyboard_arrow_down</span>
		<!-- Rounded -->
		<p>Async Courses</p>
	</button>

	{#if $planStore.length > 0}
		{@const activePlan = $planStore.find((p) => p.active)}
		{#if activePlan}
			<div class="async-courses">
				{#each activePlan.courses as course, i}
					{#if course.sections[0].IS_ASYNC}
						<AsyncCourseSection color={gencolor(i)}>
							<p class="text-center !text-gray-700">
								{course.sections[0].COURSE}-{course.sections[0].SECTION}
								<br />
								{course.sections[0].TITLE}
							</p>
						</AsyncCourseSection>
					{/if}
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	@import 'material-symbols';
	.async-div {
		height: 2.25rem;
		background-color: rgb(var(--color-surface-200));
		transition-property:
			color,
			background-color,
			border-color,
			text-decoration-color,
			fill,
			stroke,
			opacity,
			box-shadow,
			transform,
			filter,
			backdrop-filter,
			height,
			-webkit-backdrop-filter;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 500ms;
	}
	:global(.dark .async-div) {
		--tw-border-opacity: 1;
		background-color: rgb(var(--color-surface-700) / var(--tw-border-opacity)) !important;
	}
	.async-div-open {
		height: 7.5rem;
	}
	.async-div:focus-within {
		--tw-border-opacity: 1;
		border-color: rgb(var(--color-primary-500) / var(--tw-border-opacity));
	}
	:global(.dark .async-div:focus-within) {
		--tw-border-opacity: 1;
		border-color: rgb(var(--color-primary-500) / var(--tw-border-opacity)) !important;
	}
	.async-button {
		top: -15px;
		left: 15px;
		display: flex;
		align-items: center;
		border-width: var(--theme-border-base);
		background-color: rgb(var(--color-surface-200));
		border-color: rgb(var(--color-surface-400));
		border-radius: var(--theme-rounded-container);
		padding: 8px;
		transition-property:
			color,
			background-color,
			height,
			border-color,
			text-decoration-color,
			fill,
			stroke,
			opacity,
			box-shadow,
			transform,
			filter,
			backdrop-filter,
			-webkit-backdrop-filter;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 200ms;
	}
	:global(.dark .async-button) {
		background-color: rgb(var(--color-surface-700)) !important;
		border-color: rgb(var(--color-surface-500)) !important;
	}
	:global(.async-button:focus-within) {
		--tw-border-opacity: 1;
		border-color: rgb(var(--color-primary-500) / var(--tw-border-opacity)) !important;
	}
	.material-symbols-rounded {
		font-size: 24px;
		transition-property: transform;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 500ms;
	}

	.async-div-open .material-symbols-rounded {
		transform: rotate(180deg) !important;
	}

	.async-courses {
		width: 100%;
		display: flex;
		padding-top: 7.5px;
		padding-bottom: 2.5px;
	}
	.async-course {
		background-color: pink;
		border-radius: 8px;
		padding: 5px;
		margin: 5px;
	}
</style>
