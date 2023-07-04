<style lang="scss">
	.virtual-feed-root {
		position: relative;
	}
	.virtual-feed {
		position: relative;
		contain: layout;
	}
	.virtual-feed-space-remainder {
		position: absolute;
		height: 1px;
		width: 1px;
	}
</style>

<div class="virtual-feed-root" bind:this={virtualFeedRootEl} use:findScrollContainer>
	<div class="virtual-feed" style:top="{feedTopTranslate}px" data-virtual-feed-size={feedSize}>
		<div class="virtual-feed-content f-column" data-virtual-feed-rendered-count={visibleIndices.length}>
			{#each visibleIndices as index (index)}
				<div
					use:observeFeedElement={index}
					data-virtual-feed-content-index={index}
					data-known-height={lastKnownElementHeights.get(index)}
				>
					<slot {index} />
				</div>
			{/each}
		</div>
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
	export let maxRenderedItems = 40;
	export let minRenderedItems = 20;
	// the number of items the virtural viewport scrolls by when shifting
	// export let scrollAmount = 1;
	// how many items away from the bottom of the feed before we want to alert
	// the parent component that more data should be loaded
	export let moreBufferItems = 10;

	// the index of the first item currently rendered
	let topRenderedIndex = 0;
	// the height of the entire feed at its biggest size, used to maintain
	// the size of the scroll area when scrolling back up, so the scrollbar
	// doesn't shrink as you scroll up
	let feedMaxHeight = 0;
	let virtualFeedRootEl: HTMLElement;
	// cache last known sizes of elements, so we know how to reposition the feed
	// as items stop being rendered
	let lastKnownElementHeights = new Map<number, number>();

	$: visibleIndices = calculateVisibleIndices(topRenderedIndex, feedSize, maxRenderedItems);
	// the Y transform used to push down the feed to its expected position
	$: feedTopTranslate = sumHeights(lastKnownElementHeights, topRenderedIndex);
	// the size of
	$: feedMaxHeight = sumHeights(lastKnownElementHeights);

	let scrollContainer: HTMLElement | null = null;

	function findScrollContainer(el: HTMLElement) {
		scrollContainer = el.closest('.virtual-feed-scroll-container');

		(scrollContainer || window).addEventListener('scroll', onScroll);
	}

	function sumHeights(heights: Map<number, number>, indexMax = Infinity, startIndex = 0) {
		let total = 0;
		for (let i = startIndex; i < Math.min(indexMax, heights.size); i++) {
			total += heights.get(i) ?? 0;
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

	function findIndexAtHeight(top: number) {
		let topSoFar = 0;

		for (let i = 0; i < lastKnownElementHeights.size; i++) {
			topSoFar += lastKnownElementHeights.get(i) ?? 0;

			if (topSoFar > top) {
				// return the index
				return i;
			}
		}
		return lastKnownElementHeights.size;
	}

	function handleScroll() {
		let viewportTop: number;

		if (scrollContainer) {
			viewportTop = scrollContainer.scrollTop;
		} else {
			viewportTop = window?.visualViewport?.pageTop ?? 0;
		}

		safeSetTopIndex(findIndexAtHeight(viewportTop - virtualFeedRootEl.offsetTop) - Math.floor(maxRenderedItems / 2));

		if (topRenderedIndex + maxRenderedItems >= feedSize - moreBufferItems) {
			dispatch('more');
		}
	}

	const handleScrollThrottled = new Throttler(handleScroll);

	function onScroll() {
		handleScrollThrottled.run();
	}

	onDestroy(() => {
		if (!browser) {
			return;
		}

		(scrollContainer || window).removeEventListener('scroll', onScroll);
	});
</script>
