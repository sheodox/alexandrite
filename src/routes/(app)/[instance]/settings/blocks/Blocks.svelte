<style lang="scss">
	.card {
		width: 100%;
	}
</style>

<div class="card p-2">
	<div class="blocks f-column gap-4">
		<h2 class="m-0">{typeName}</h2>
		<slot />
	</div>
</div>

<script lang="ts">
	// used for the header for this section of blocks, should be something like "Communities"
	export let typeName: string;
</script>
