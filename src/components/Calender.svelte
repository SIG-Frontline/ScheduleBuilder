<div class="flex flex-col">
	{#each Array.from({ length: 17 }) as _, i}
		<p class="text-cente ml-1 mr-1 w-5 translate-y-1/2 transform bg-surface-50">
			{i}
		</p>
		<hr class="ml-[5%] h-[2px] w-[90%] bg-black md:ml-[4%] md:w-[95%]" />
	{/each}
</div>
