<script lang="ts">
	import 'material-symbols';
	import NavBar from '../components/NavBar.svelte';
	import NavTabs from '../components/NavTabs.svelte';
	import NavDrawer from '../components/NavDrawer.svelte';
	import { initializeStores, Modal } from '@skeletonlabs/skeleton';
	initializeStores();
</script>

<Modal background="bg-green-500" />
<main class="relative overflow-hidden lg:mr-20">
	<NavDrawer />
	<NavBar />
	<slot />
</main>
<NavTabs />
