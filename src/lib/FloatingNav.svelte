<style>
	.floating-nav {
		background: var(--sx-gray-900);
		border-radius: 10px;
		border: 1px solid var(--sx-gray-500);
	}
</style>

<div class="floating-nav f-row m-1 p-1 align-items-center gap-1" bind:this={elementInNav}>
	<slot name="prepend" />
	{#if showScrollToTop}
		<IconButton cl="tertiary" on:click={scrollToTop} icon="angles-up" text="Scroll to top" />
	{/if}
	<slot />
	<slot name="append" />
</div>

<script lang="ts">
	import IconButton from '$lib/IconButton.svelte';
	import { getVirtualFeedScrollableElement } from './virtual-feed';

	let elementInNav: HTMLElement;
	export let showScrollToTop = true;

	function scrollToTop() {
		const scrollEl = getVirtualFeedScrollableElement(elementInNav);

		if (scrollEl) {
			scrollEl.scrollTop = 0;
		} else {
			window.scrollY = 0;
		}
	}
</script>
