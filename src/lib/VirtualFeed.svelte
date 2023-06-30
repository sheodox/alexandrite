<style lang="scss">
	.virtual-feed-root {
		position: relative;
	}
	.virtual-feed {
		position: relative;
		contain: layout;
	}
	.virtual-feed-sensor {
		pointer-events: none;
		height: 700px;
		width: 20px;
		position: absolute;

		&.bottom {
			bottom: 0;
		}
	}
	.virtual-feed-space-remainder {
		position: absolute;
		height: 1px;
		width: 1px;
	}
</style>

<div class="virtual-feed-root">
	<div class="virtual-feed" style:transform="translateY({feedTopTranslate}px)" data-virtual-feed-size={feedSize}>
		<div bind:this={topEl} class="virtual-feed-sensor top" />
		<div class="virtual-feed-content" data-virtual-feed-rendered-count={visibleIndices.length}>
			{#each visibleIndices as index (index)}
				<div use:observeFeedElement={index} data-virtual-feed-content-index={index}>
					<slot {index} />
				</div>
			{/each}
		</div>
		<div bind:this={bottomEl} class="virtual-feed-sensor bottom" />
		<InfiniteFeed {endOfFeed} {feedEndIcon} {feedEndMessage} {loading} {loadMoreFailed} on:more />
	</div>
</div>

<div class="virtual-feed-space-remainder" style:top="{feedMaxHeight}px" />

<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import InfiniteFeed from './feeds/posts/InfiniteFeed.svelte';
	import { Throttler } from './utils';

	const dispatch = createEventDispatcher<{
		more: void;
	}>();

	export let endOfFeed: boolean;
	export let loading: boolean;
	export let loadMoreFailed: boolean;
	export let feedEndMessage: string;
	export let feedEndIcon: string;

	// number of items in the entire feed
	export let feedSize: number;
	// number of items to show at once
	export let maxRenderedItems = 30;
	export let minRenderedItems = 20;
	// the number of items the virtural viewport scrolls by when shifting
	// export let scrollAmount = 1;
	// how many items away from the bottom of the feed before we want to alert
	// the parent component that more data should be loaded
	export let moreBufferItems = 5;

	// the index of the first item currently rendered
	let topRenderedIndex = 0;
	// the height of the entire feed at its biggest size, used to maintain
	// the size of the scroll area when scrolling back up, so the scrollbar
	// doesn't shrink as you scroll up
	let feedMaxHeight = 0;
	let topEl: HTMLElement;
	let bottomEl: HTMLElement;
	// observers above/below the rendered elements in the feed to detect the direction
	// the user is scrolling and continue rendering the feed in that direction
	let feedUpObserver: IntersectionObserver | null;
	let feedDownObserver: IntersectionObserver | null;
	// cache last known sizes of elements, so we know how to reposition the feed
	// as items stop being rendered
	let lastKnownElementHeights = new Map<number, number>();

	$: visibleIndices = calculateVisibleIndices(topRenderedIndex, feedSize, maxRenderedItems);
	// the Y transform used to push down the feed to its expected position
	$: feedTopTranslate = sumHeights(lastKnownElementHeights, topRenderedIndex);
	// the size of
	$: feedRenderedHeight = sumHeights(
		lastKnownElementHeights,
		topRenderedIndex + visibleIndices.length,
		topRenderedIndex
	);
	$: feedMaxHeight = sumHeights(lastKnownElementHeights);

	function sumHeights(heights: Map<number, number>, indexMax = Infinity, startIndex = 0) {
		const asArray = Array.from(heights.values());

		let total = 0;
		for (let i = startIndex; i < Math.min(indexMax, asArray.length); i++) {
			total += asArray[i];
		}
		return total;
	}

	function observeFeedElement(el: HTMLElement, index: number) {
		const resizeObserver = new ResizeObserver((entries) => {
			const height = entries[0].borderBoxSize[0].blockSize;
			lastKnownElementHeights.set(index, height);
			lastKnownElementHeights = lastKnownElementHeights;
		});

		resizeObserver.observe(el);

		return {
			destroy: () => {
				resizeObserver.disconnect();
			}
		};
	}

	function calculateVisibleIndices(topRenderedIndex: number, feedSize: number, maxRenderedItems: number) {
		const renderableSize = Math.min(maxRenderedItems, feedSize - topRenderedIndex);
		const indices = Array(renderableSize);

		for (let i = 0; i < renderableSize; i++) {
			indices[i] = topRenderedIndex + i;
		}
		return indices;
	}

	function safeSetTopIndex(newIndex: number) {
		// clamp to valid values
		topRenderedIndex = Math.min(Math.max(0, feedSize - minRenderedItems), Math.max(0, newIndex));
	}

	function shiftViewport(dir: number) {
		const by = dir;
		// clamp to valid values
		safeSetTopIndex(topRenderedIndex + by);

		// if we're nearing the end of the known feed items, ask for more
		if (topRenderedIndex + maxRenderedItems >= feedSize - moreBufferItems) {
			dispatch('more');
		}
	}

	function scrollingUp(entries: IntersectionObserverEntry[]) {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				shiftViewport(-1);
			}
		}
	}

	function scrollingDown(entries: IntersectionObserverEntry[]) {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				shiftViewport(1);
			}
		}
	}

	function findIndexAtHeight(top: number) {
		let topSoFar = 0,
			heights = Array.from(lastKnownElementHeights.entries());

		for (let i = 0; i < heights.length; i++) {
			topSoFar += heights[i][1];

			if (topSoFar > top) {
				// return the index
				return heights[i][0];
			}
		}
		return heights.length;
	}

	function checkIfLost() {
		const feedScrollPosition = window.visualViewport?.pageTop || 0;
		if (feedScrollPosition < feedTopTranslate || feedScrollPosition > feedTopTranslate + feedRenderedHeight) {
			const viewportTop = window?.visualViewport?.pageTop;
			if (typeof viewportTop !== 'number') {
				console.warn("couldn't find the viewport's scroll position");
				return;
			}
			safeSetTopIndex(findIndexAtHeight(viewportTop) - Math.floor(maxRenderedItems / 2));
		}
	}

	const throttler = new Throttler(checkIfLost);

	function onScroll() {
		throttler.run();
	}

	onMount(() => {
		if (!browser) {
			return;
		}
		const opts = {
			threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
		};
		feedUpObserver = new IntersectionObserver(scrollingUp, opts);
		feedDownObserver = new IntersectionObserver(scrollingDown, opts);
		feedUpObserver.observe(topEl);
		feedDownObserver.observe(bottomEl);

		window.addEventListener('scroll', onScroll);
	});

	onDestroy(() => {
		if (!browser) {
			return;
		}
		feedUpObserver?.disconnect();
		feedDownObserver?.disconnect();
		window.removeEventListener('scroll', onScroll);
	});
</script>
