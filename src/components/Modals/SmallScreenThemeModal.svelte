<script lang="ts">
	import { THEMES } from '$lib/constants';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { setTheme } from '$lib/setTheme';
	import { themeState } from '$lib/themeStateStore';
	$: setTheme($themeState);
</script>

<span class=" flex flex-col justify-center gap-4 text-2xl font-bold">
	<h1 class="align-center text-primary-900-50-token">Select your theme</h1>
	<select class="select block !w-96 !max-w-[80vw]" bind:value={$themeState}>
		{#each THEMES as theme}
			<option value={theme.id}>{theme.label}</option>
		{/each}
	</select>
	<h1 class="align-center text-primary-900-50-token">Toggle Dark Mode</h1>
	<LightSwitch class="block" />
</span>
