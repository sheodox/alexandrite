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

<div class="virtual-feed-root" bind:this={virtualFeedRootEl} use:initScrollContainer>
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
	import { onDestroy, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import InfiniteFeed from './feeds/posts/InfiniteFeed.svelte';
	import { Throttler } from './utils';

	const dispatch = createEventDispatcher<{
			more: void;
		}>(),
		INITIAL_MINIMUM_RENDER_ITEMS = 10,
		// numberOfItemsTorender = number of items that fit in: (viewportHeight * OVERSCAN_FACTOR)
		// we want to render more items than actually fit on the screen, so that we can throttle the
		// scroll event handler without the user seeing a blank feed unless they scroll fast
		OVERSCAN_FACTOR = 3;

	export let endOfFeed: boolean;
	export let loading: boolean;
	export let loadMoreFailed: boolean;
	export let feedEndMessage: string;
	export let feedEndIcon: string;

	// number of items in the entire feed
	export let feedSize: number;
	// the number of items the virtural viewport scrolls by when shifting
	// export let scrollAmount = 1;
	// how many items away from the bottom of the feed before we want to alert
	// the parent component that more data should be loaded
	export let moreBufferItems = 10;

	// the index of the first item currently rendered
	let startIndex = 0;
	let length = Math.min(feedSize, 20);
	// the height of the entire feed at its biggest size, used to maintain
	// the size of the scroll area when scrolling back up, so the scrollbar
	// doesn't shrink as you scroll up
	let feedMaxHeight = 0;
	let virtualFeedRootEl: HTMLElement;
	// cache last known sizes of elements, so we know how to reposition the feed
	// as items stop being rendered
	let lastKnownElementHeights = new Map<number, number>();

	$: hadInitialMeasurement = lastKnownElementHeights.size >= INITIAL_MINIMUM_RENDER_ITEMS;
	// if we've measured the first few items, re-render just once to figure out
	// how many we actually should show, now that we can estimate an average height
	let firstRerenderDone = false;
	$: if (!firstRerenderDone && hadInitialMeasurement) {
		firstRerenderDone = true;
		computeViewportItems();
	}

	$: visibleIndices = calculateVisibleIndices(startIndex, feedSize, length);
	// the Y transform used to push down the feed to its expected position
	$: feedTopTranslate = sumHeights(lastKnownElementHeights, startIndex);
	// the size of
	$: feedMaxHeight = sumHeights(lastKnownElementHeights);

	let scrollContainer: HTMLElement | null = null;
	let mounted = false;

	function initScrollContainer(el: HTMLElement) {
		scrollContainer = el.closest('.virtual-feed-scroll-container');

		(scrollContainer || window).addEventListener('scroll', scheduleViewportItemsCalculation);
		computeViewportItems();
		mounted = true;
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
			const height = entries[0].borderBoxSize[0].blockSize,
				lastHeight = lastKnownElementHeights.get(index);
			lastKnownElementHeights.set(index, height);
			lastKnownElementHeights = lastKnownElementHeights;

			if (typeof lastHeight === 'number' && (lastHeight > 0 || height > 0)) {
				// check if there's a significant change in height, then try to re-compute the items to show in the feed
				if (Math.min(height, lastHeight) / Math.max(height, lastHeight) < 0.5) {
					scheduleViewportItemsCalculation();
				}
			}
		});

		resizeObserver.observe(el);

		return {
			destroy: () => {
				resizeObserver.disconnect();
			}
		};
	}

	function calculateVisibleIndices(topRenderedIndex: number, feedSize: number, length: number) {
		if (!hadInitialMeasurement) {
			length = INITIAL_MINIMUM_RENDER_ITEMS;
		}
		const renderableSize = Math.min(length, feedSize - topRenderedIndex);
		if (renderableSize <= 0) {
			return [];
		}
		const indices = Array(renderableSize);

		for (let i = 0; i < renderableSize; i++) {
			indices[i] = topRenderedIndex + i;
		}
		return indices;
	}

	// if the feed size has changed drastically, we need to try re-rendering,
	// because if it was 0 before, nothing is visible until we retry calculations
	$: if (feedSize) {
		scheduleViewportItemsCalculation();
	}

	function safeSetTopIndex(newIndex: number) {
		// clamp to valid values
		startIndex = Math.min(feedSize, Math.max(0, newIndex));
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

	function requestMore() {
		if (!endOfFeed && !loading) {
			dispatch('more');
		}
	}

	function computeViewportItems() {
		if (!mounted) {
			return;
		}
		if (!hadInitialMeasurement) {
			// if we haven't seen enough elements to measure, just try and get more
			if (feedSize < INITIAL_MINIMUM_RENDER_ITEMS) {
				requestMore();
			}
			return;
		}

		let viewportTop: number;

		if (scrollContainer) {
			viewportTop = scrollContainer.scrollTop;
		} else {
			viewportTop = window?.visualViewport?.pageTop ?? 0;
		}

		const { offsetTop: rootTop } = virtualFeedRootEl,
			// how much height we have to work with
			availableHeight = window.visualViewport?.height ?? window.innerHeight,
			// subtract one, because one == the amount that fits on screen, we're dividing the
			// remainder evenly to find how much to overscan by on each side
			overscanFactorEachSide = Math.floor((OVERSCAN_FACTOR - 1) / 2),
			overscanPxEachSide = overscanFactorEachSide * availableHeight,
			// try looking for this amount of height stuff,
			overscanHeight = availableHeight * OVERSCAN_FACTOR,
			// evenly space the overscan by subtracting by the start's overscan amount
			topIndex = findIndexAtHeight(viewportTop - rootTop - overscanPxEachSide);

		let numItemsFitOnScreen = 0,
			contentHeight = 0,
			averageHeight = feedMaxHeight / lastKnownElementHeights.size;

		for (let i = topIndex; i < feedSize; i++) {
			numItemsFitOnScreen++;
			const itemEstimatedHeight = lastKnownElementHeights.get(i) ?? averageHeight;
			// set the last known height to this, if we used the average height it could be
			// wrong, and if we set it we'll know it changed considerably once we know the size,
			// and can trigger a re-render
			lastKnownElementHeights.set(i, itemEstimatedHeight);
			contentHeight += itemEstimatedHeight;
			if (contentHeight > overscanHeight) {
				break;
			}
		}

		// want to overscan a bit, start 25% earlier, and go for 25% longer,
		// and since this is length, it's 150%;
		length = numItemsFitOnScreen;

		safeSetTopIndex(topIndex);

		if (startIndex + length >= feedSize - moreBufferItems) {
			requestMore();
		}
	}

	const renderThrottled = new Throttler(computeViewportItems);

	function scheduleViewportItemsCalculation() {
		renderThrottled.run();
	}

	onDestroy(() => {
		if (!browser) {
			return;
		}
		mounted = false;

		(scrollContainer || window).removeEventListener('scroll', scheduleViewportItemsCalculation);
	});
</script>
