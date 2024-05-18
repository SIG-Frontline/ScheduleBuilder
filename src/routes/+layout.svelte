<script lang="ts">
	import 'material-symbols';
	import NavBar from '../components/NavBar.svelte';
	import NavTabs from '../components/NavTabs.svelte';
	import NavDrawer from '../components/NavDrawer.svelte';
	import { initializeStores, Modal } from '@skeletonlabs/skeleton';
	import { drawerState } from '$lib/drawerStateStore';
	initializeStores();
</script>

<Modal background="bg-green-500" />
<main
	class="relative overflow-hidden transition-all duration-300 ease-in-out lg:mr-20"
	style:--margin-right={$drawerState === 'closed' ? '5rem' : '24rem'}
>
	<NavDrawer />
	<NavBar />
	<slot />
</main>
<NavTabs />

<style>
	@media (min-width: 1024px) {
		main {
			margin-right: var(--margin-right);
		}
	}
</style>
