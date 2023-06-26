<style>
	hr {
		border-color: var(--sx-gray-transparent-light);
	}
	#scroll-more {
		position: relative;
		top: -750px;
	}
	.end-of-feed {
		height: 20rem;
		background: var(--sx-gray-800);
	}
</style>

<div class="py-1">
	<Stack dir="column" gap={1}>
		{#each postViews as pv, i (pv.post.id)}
			<Post postView={pv} on:overlay />
			{#if i + 1 < postViews.length}
				<hr class="w-100" />
			{/if}
		{/each}
	</Stack>
</div>

<div bind:this={scrollMore} id="scroll-more" />
{#if endOfFeed}
	<section class="end-of-feed f-row justify-content-center">
		<Stack dir="c" align="center" justify="center" cl="f-1">
			<p class="m-0 sx-font-size-12"><Icon icon="file-circle-xmark" variant="icon-only" /></p>
			<p class="m-0 sx-font-size-6">No more posts!</p>
		</Stack>
	</section>
{/if}

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import Post from './Post.svelte';
	import type { PostView } from 'lemmy-js-client';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher<{ more: void }>();

	export let postViews: PostView[];
	export let endOfFeed: boolean;

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
