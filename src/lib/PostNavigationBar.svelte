<FloatingNavContainer justify="end">
	{#if isSearching}
		<FloatingNav showScrollToTop={false}>
			<span class="search fw-bold px-2"
				><Icon icon="magnifying-glass" /> Result {searchResultIndex + 1}/{searchResultCount}</span
			>
			<IconButton
				cl="tertiary"
				on:click={() => dispatch('scroll-previous-result')}
				icon="chevron-up"
				text="Previous Result"
				disabled={!canScrollPrevResult}
			/>
			<IconButton
				cl="tertiary"
				on:click={() => dispatch('scroll-next-result')}
				icon="chevron-down"
				text="Next Result"
				disabled={!canScrollNextResult}
			/>
			<IconButton
				cl="tertiary"
				on:click={() => dispatch('clear-search')}
				icon="delete-left"
				text="Clear Search"
				disabled={!canScrollNext}
			/>
		</FloatingNav>
	{/if}

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
</FloatingNavContainer>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Icon } from 'sheodox-ui';
	import IconButton from '$lib/IconButton.svelte';
	import FloatingNav from './FloatingNav.svelte';
	import FloatingNavContainer from './FloatingNavContainer.svelte';

	// if you can close the post (viewing a post in a feed, not directly)
	export let closeable: boolean;
	export let canScrollPrev: boolean;
	export let canScrollNext: boolean;
	export let canScrollPrevResult: boolean;
	export let canScrollNextResult: boolean;
	export let isSearching: boolean;
	export let searchResultCount: number;
	export let searchResultIndex: number;

	const dispatch = createEventDispatcher<{
		'scroll-next': void;
		'scroll-previous': void;
		'scroll-next-result': void;
		'scroll-previous-result': void;
		'clear-search': void;
		close: void;
	}>();
</script>
