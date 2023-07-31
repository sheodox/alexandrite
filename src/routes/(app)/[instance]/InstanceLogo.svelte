<Avatar src={$siteMeta.site_view.site.icon} icon="network-external" {size} resolution={96} />

<script lang="ts">
	import Avatar from '$lib/Avatar.svelte';
	import { getAppContext } from '$lib/app-context';
	const { siteMeta } = getAppContext();

	export let size = '2rem';
</script>
