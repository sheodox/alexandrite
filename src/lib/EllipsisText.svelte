<style>
	.ellipsis-text {
		display: inline-block;
		max-width: 20rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		vertical-align: bottom;
	}
</style>

<span class="ellipsis-text">
	<slot />
</span>
