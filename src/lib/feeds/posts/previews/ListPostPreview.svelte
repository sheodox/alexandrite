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

<article class="post px-2 f-row align-items-center post-mode-{mode}">
	<Stack dir="c" gap={2} cl="w-100 py-1">
		<div class="f-row gap-3 align-items-center post-stuff">
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
			<Stack dir="c" gap={2}>
				<PostTitle {postView} on:overlay modeList={true} {supportsOverlay} />
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
				<Stack dir="r" gap={2} align="center">
					<slot name="embed-expand" />
					<slot name="actions" />
					<PostTime {postView} />
				</Stack>
			</Stack>
		</div>
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

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	export let postView: PostView;
	export let mode: 'show' | 'list' = 'list';
	export let supportsOverlay = true;

	const { screenDimensions } = getAppContext();

	$: mobileScreenWidth = $screenDimensions.width < 600;
	$: thumbnailHeight = mobileScreenWidth ? '3rem' : '6rem';
	$: postAssertions = makePostAssertions(postView);
</script>
