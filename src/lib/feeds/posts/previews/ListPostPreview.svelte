<style lang="scss">
	.embed-content {
		width: 60rem;
		max-width: 100%;
	}

	button,
	.button {
		margin: 0;
	}
	@media (max-width: 600px) {
		.post-stuff {
			flex-wrap: wrap;
		}
	}
</style>

<article class="post px-2 f-row align-items-center post-mode-{mode}" use:checkSize>
	<Stack dir="c" gap={2} cl="w-100 py-1">
		<div class="f-row gap-3 align-items-start post-stuff">
			<Stack dir="r" gap={2} align="center">
				<slot name="vote-buttons" small={mobileScreenWidth} dir="column" />
				{#if supportsOverlay}
					<button class="m-0 p-0" on:click={() => dispatch('overlay', postView.post.id)}
						><PostThumbnail {postView} height={thumbnailHeight} /></button
					>
				{:else}
					<PostThumbnail {postView} height={thumbnailHeight} />
				{/if}
			</Stack>
			<Stack dir="c" gap={2} cl="f-1">
				<PostTitle {postView} on:overlay modeList={mode === 'list'} {supportsOverlay} />
				{#if postAssertions.is.externalLink}
					<div class="responsive-text">
						<slot name="post-link" />
					</div>
				{/if}
				<Stack dir="r" gap={1} align="start" cl="f-wrap responsive-text">
					<slot name="creator" />
					to
					<slot name="community" />
				</Stack>
				{#if direction === 'row' && mode === 'list'}
					<ListContentPreviews {postView} />
				{/if}
				{#if !buttonsBelow}
					<Stack dir="r" gap={2} align="center" cl="responsive-text">
						<slot name="embed-expand" />
						<slot name="actions" />
						<PostTime {postView} />
					</Stack>
				{/if}
			</Stack>
		</div>
		{#if direction === 'column' && mode === 'list'}
			<ListContentPreviews {postView} />
		{/if}
		{#if buttonsBelow}
			<Stack dir="r" gap={2} align="center" cl="responsive-text">
				<slot name="embed-expand" />
				<slot name="actions" />
				<PostTime {postView} />
			</Stack>
		{/if}
	</Stack>
</article>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import PostTitle from '../PostTitle.svelte';
	import PostThumbnail from '../PostThumbnail.svelte';
	import PostTime from '../PostTime.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { PostView } from 'lemmy-js-client';
	import { getAppContext } from '$lib/app-context';
	import { makePostAssertions } from '../post-utils';
	import ListContentPreviews from './ListContentPreviews.svelte';

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	export let postView: PostView;
	export let mode: 'show' | 'list' = 'list';
	export let supportsOverlay = true;
	let direction = 'row';
	let buttonsBelow = false;

	const { screenDimensions } = getAppContext();

	function checkSize(el: HTMLElement) {
		const obs = new ResizeObserver((entries) => {
			const availableWidth = entries.at(0)?.borderBoxSize[0]?.inlineSize ?? 0;
			direction = availableWidth < 900 ? 'column' : 'row';
			buttonsBelow = availableWidth < 600;
		});
		obs.observe(el);
		return { destroy: () => obs.disconnect() };
	}

	$: mobileScreenWidth = $screenDimensions.width < 600;
	$: thumbnailHeight = mobileScreenWidth ? '3rem' : '6rem';
	$: postAssertions = makePostAssertions(postView);
</script>
