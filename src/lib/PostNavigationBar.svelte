<FloatingNav>
	<IconButton
		cl="tertiary"
		on:click={() => dispatch('scroll-previous')}
		icon="chevron-up"
		text="Previous Comment"
		disabled={!canScrollPrev}
	/>
	<IconButton
		cl="tertiary"
		on:click={() => dispatch('scroll-next')}
		icon="chevron-down"
		text="Next Comment"
		disabled={!canScrollNext}
	/>
	{#if closeable}
		<IconButton cl="tertiary" on:click={() => dispatch('close')} icon="times" text="Close Post" />
	{/if}
</FloatingNav>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import IconButton from '$lib/IconButton.svelte';
	import { getVirtualFeedScrollableElement } from './virtual-feed';
	import FloatingNav from './FloatingNav.svelte';

	// if you can close the post (viewing a post in a feed, not directly)
	export let closeable: boolean;
	export let canScrollPrev: boolean;
	export let canScrollNext: boolean;

	let elementInNav: HTMLElement;

	const dispatch = createEventDispatcher<{
		'scroll-next': void;
		'scroll-previous': void;
		close: void;
	}>();

	function scrollToTop() {
		const scrollEl = getVirtualFeedScrollableElement(elementInNav);

		if (scrollEl) {
			scrollEl.scrollTop = 0;
		} else {
			window.scrollY = 0;
		}
	}
</script>
