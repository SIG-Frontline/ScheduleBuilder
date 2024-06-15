<!--Async Section -->
<script>
	import arrow from '$lib/arrow-head.png';

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
</script>

<div
	bind:this={async_container}
	class="async-div async-div-open align-center fixed bottom-0 z-30 flex w-[200vw] flex-row border-surface-500 bg-surface-700 pt-5 lg:w-full"
>
	<button
		class="async-button absolute z-30 border border-surface-500 bg-surface-700 rounded-token"
		on:click={toggleAsync}
	>
		<span class="material-symbols-rounded">keyboard_arrow_down</span>
		<!-- Rounded -->
		<p>Async Courses</p>
	</button>
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
</style>
