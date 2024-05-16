<script>
	import Calender from '../components/Calender.svelte';
</script>

<!-- this scrollable container is necessary to prevent the calender from overflowing the viewport -->
<div class="relative max-h-[calc(100vh-6rem)] overflow-x-auto overflow-y-scroll">
	<Calender />
</div>
