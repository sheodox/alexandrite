<style>
	.floating-nav {
		position: fixed;
		bottom: var(--sx-spacing-2);
		background: var(--sx-gray-900);
		border-radius: 10px;
		border: 1px solid var(--sx-gray-500);
	}
</style>

<div class="f-row justify-content-{justify}">
	<div class="floating-nav f-row p-1 m-1">
		<!-- just need an element in the nav to try searching for the closest vitual
		feed scroll area for contained (some element scrolls, not the window) virtual
		feeds like when viewing a post in a feed -->
		<div bind:this={elementInNav} />
		<IconButton cl="tertiary" on:click={scrollToTop} icon="angles-up" text="Scroll to top" />
		<slot />
	</div>
</div>

<script lang="ts">
	import IconButton from '$lib/IconButton.svelte';
	import { getVirtualFeedScrollableElement } from './virtual-feed';

	export let justify = 'center';

	let elementInNav: HTMLElement;

	function scrollToTop() {
		const scrollEl = getVirtualFeedScrollableElement(elementInNav);

		if (scrollEl) {
			scrollEl.scrollTop = 0;
		} else {
			window.scrollY = 0;
		}
	}
</script>
