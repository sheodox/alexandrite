<style>
	.scroll-more {
		position: relative;
		margin-top: -750px;
		height: 750px;
		pointer-events: none;
	}
</style>

{#if !endOfFeed}
	{#if loadMoreFailed}
		<FeedBanner message="Retry loading more?" icon="bug">
			<button class="tertiary" on:click={() => dispatch('more')} disabled={loading}>Retry</button>
		</FeedBanner>
	{:else}
		<FeedBanner message={loading ? 'Loading more...' : 'Load more?'} icon="download" {loading}>
			<button class="tertiary" on:click={() => dispatch('more')} disabled={loading}>Load More</button>
		</FeedBanner>
	{/if}
{:else}
	<FeedBanner message={feedEndMessage} icon={feedEndIcon} />
{/if}

<div bind:this={scrollMore} class="scroll-more" />

<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import FeedBanner from './FeedBanner.svelte';

	const dispatch = createEventDispatcher<{
		more: void;
	}>();

	export let endOfFeed: boolean;
	export let loading: boolean;
	export let loadMoreFailed: boolean;
	export let feedEndMessage: string;
	export let feedEndIcon: string;

	let scrollMore: HTMLElement;
	let observer: IntersectionObserver | null;

	function maybeMore(entries: IntersectionObserverEntry[]) {
		if (endOfFeed) {
			observer?.disconnect();
			observer = null;
			return;
		}
		for (const entry of entries) {
			if (entry.isIntersecting) {
				dispatch('more');
				return;
			}
		}
	}

	onMount(() => {
		observer = new IntersectionObserver(maybeMore, {
			threshold: [0.01, 0.9]
		});
		observer.observe(scrollMore);
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>
