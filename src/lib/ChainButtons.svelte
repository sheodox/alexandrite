<!-- we shouldn't be showing enough to wrap if our calculations work,
but using f-wrap so the element doesn't overflow the container
and make us show every button all the time -->
<div class="chain-buttons f-row f-1 gap-2 f-wrap" use:observeContainer>
	{#each outside as action, index}
		<div use:observeOutside={{ index }}>
			<ExtraActionButton {cl} {action} />
		</div>
	{/each}
	<!-- if we haven't measured its width yet show the overflow anyway -->
	{#if overflowWidth === null || collapsed.length}
		<div class="chain-overflow" use:observeOverflow>
			<!-- when we don't know the size yet, give it all actions so it shows instead of hiding itself -->
			<ExtraActions actions={overflowWidth !== null ? collapsed : actions} {cl} />
		</div>
	{/if}
</div>

<script lang="ts">
	import type { ExtraAction } from './utils';
	import ExtraActions from './ExtraActions.svelte';
	import ExtraActionButton from './ExtraActionButton.svelte';

	export let actions: ExtraAction[];
	export let cl = '';

	let outsideAmount = Infinity;
	let availableWidth: number | null = null;
	let overflowWidth: number | null = null;
	// map of action indexes to button widths
	const actionSizes = new Map<number, number>();

	$: outside = actions.slice(0, outsideAmount);
	$: collapsed = actions.slice(outsideAmount);

	const buttonGap = 8; //.gap-2 is 8px wide, this is the spacing between buttons

	function fit() {
		let outsideWidth = 0,
			canFit = -1;

		if (availableWidth === null || overflowWidth === null) {
			return;
		}

		for (let i = 0; i < actions.length; i++) {
			outsideWidth += (actionSizes.get(i) ?? 0) + (i > 0 ? buttonGap : 0);
			const hasMoreActionsAfterThis = i + 1 < actions.length;

			if (outsideWidth + (hasMoreActionsAfterThis ? overflowWidth + buttonGap : 0) < availableWidth) {
				canFit = i;
			} else {
				break;
			}
		}

		outsideAmount = canFit + 1;
	}

	function watchSize(el: HTMLElement, updateFn: (width: number) => void) {
		const obs = new ResizeObserver((entries) => {
			const width = entries[0].borderBoxSize[0].inlineSize;
			updateFn(width);

			fit();
		});

		obs.observe(el);

		return {
			destroy: () => {
				obs.disconnect();
			}
		};
	}

	function observeContainer(el: HTMLElement) {
		return watchSize(el, (width) => {
			availableWidth = width;
		});
	}

	function observeOutside(el: HTMLElement, { index }: { index: number }) {
		return watchSize(el, (width) => {
			actionSizes.set(index, width);
		});
	}

	function observeOverflow(el: HTMLElement) {
		return watchSize(el, (width) => {
			overflowWidth = width;
		});
	}
</script>
