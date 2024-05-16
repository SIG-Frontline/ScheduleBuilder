<script>
	export let top = 0;
	export let left = 0;
	export let width = 0;
	export let height = 0;
	export let color = '!bg-red-200';
</script>

<button
	class="card card-hover absolute inline-block !rounded-md {color} py-2"
	style="top: {top}px; left: {left}px; width: {width}px; height: {height}px;"
>
	<slot></slot>
</button>
