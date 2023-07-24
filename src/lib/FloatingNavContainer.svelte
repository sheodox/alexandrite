<style>
	.floating-nav-container {
		position: fixed;
		bottom: var(--sx-spacing-2);
	}
</style>

<div class="f-row justify-content-{justify}">
	<div class="floating-nav-container f-row gap-2">
		<slot />
	</div>
</div>

<script lang="ts">
	export let justify = 'center';
</script>
