<style lang="scss">
	div {
		margin-right: var(--sx-spacing-2);
		:global(img) {
			margin: 0 !important;
		}
	}
</style>

<div>
	<Avatar src={$siteMeta.site_view.site.icon} icon="network-external" {size} resolution={96} />
</div>

<script lang="ts">
	import Avatar from '$lib/Avatar.svelte';
	import { getAppContext } from '$lib/app-context';
	const { siteMeta } = getAppContext();

	export let size = '2rem';
</script>
