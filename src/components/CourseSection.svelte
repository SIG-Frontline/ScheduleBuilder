<script lang="ts">
	import { fade } from 'svelte/transition';

	export let top: Number | null = null;
	export let left: Number | null = null;
	export let width: Number | null = null;
	export let height: Number | null = null;
	export let color = '!bg-red-200';
</script>

<!-- this promise is used to wait for the top, and height to be defined before rendering the button so it doesn't jump around -->
<!-- its only top and height to prevent it from flickering when resizing -->
{#await new Promise((resolve) => {
	if (top && height) {
		//@ts-ignore (cant do ts in svelte markup to my knowledge)
		resolve();
	}
}) then}
	<button
		class="card card-hover absolute inline-block !rounded-md {color} py-2"
		style="top: {top}px; left: {left}px; width: {width}px; height: {height}px;"
		in:fade={{ duration: 333 }}
	>
		<slot></slot>
	</button>
{/await}
