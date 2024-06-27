<script lang="ts">
	export let color = '!bg-red-200';
</script>

<!-- this promise is used to wait for the top, and height to be defined before rendering the button so it doesn't jump around -->
<!-- its only top and height to prevent it from flickering when resizing -->

<div class="async-course card {color}">
	<slot></slot>
</div>

<style>
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
