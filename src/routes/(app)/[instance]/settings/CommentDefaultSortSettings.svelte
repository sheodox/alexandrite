<DescriptiveToggles legend="Comment Default Sort" bind:group={$commentDefaultSort} options={CommentSortOptions} />

<script lang="ts">
	import DescriptiveToggles from '$lib/DescriptiveToggles.svelte';
	import { CommentSortOptions } from '$lib/feed-filters';
	import { getSettingsContext } from '$lib/settings-context';

	const { commentDefaultSort } = getSettingsContext();
</script>
