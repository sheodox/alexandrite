{#if loadMoreFailed}
	<FeedBanner message="Retry loading more?" icon="bug">
		<button class="tertiary f-row gap-1" on:click={() => dispatch('more')} disabled={loading}>
			{#if loading}
				<Spinner />
			{/if}
			Retry
		</button>
	</FeedBanner>
{:else if !endOfFeed}
	<FeedBanner message={loading ? 'Loading more...' : 'Load more?'} icon="download" {loading}>
		<button class="tertiary" on:click={() => dispatch('more')} disabled={loading}> Load More</button>
	</FeedBanner>
{:else}
	<FeedBanner message={feedEndMessage} icon={feedEndIcon} />
{/if}

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import FeedBanner from './FeedBanner.svelte';
	import Spinner from '$lib/Spinner.svelte';

	const dispatch = createEventDispatcher<{
		more: void;
	}>();

	export let endOfFeed: boolean;
	export let loading: boolean;
	export let loadMoreFailed: boolean;
	export let feedEndMessage: string;
	export let feedEndIcon: string;
</script>
