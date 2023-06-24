<style>
	hr {
		border-color: var(--sx-gray-transparent-light);
	}
	#scroll-more {
		position: relative;
		top: -750px;
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

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Post from './Post.svelte';
	import type { PostView } from 'lemmy-js-client';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher<{ more: void }>();

	export let postViews: PostView[];

	let scrollMore: HTMLElement;
	let observer: IntersectionObserver;

	function maybeMore(entries: IntersectionObserverEntry[]) {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				dispatch('more');
				return;
			}
		}
	}

	onMount(() => {
		observer = new IntersectionObserver(maybeMore, {
			threshold: 0.01
		});
		observer.observe(scrollMore);
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>
