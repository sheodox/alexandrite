<style lang="scss">
	article {
		width: 50rem;
		max-width: 100%;
		margin: 0 auto;
		position: relative;
	}

	article:focus {
		outline: none;

		:global(.post-preview-card) {
			outline: 2px solid var(--sx-input-focus-color);
			outline-offset: 2px;
		}
	}
	article :global(.post-preview-card) {
		overflow: hidden;
		position: relative;
	}
	.post :global(.card) {
		overflow: hidden;
		border: 1px solid var(--sx-gray-transparent);
	}
	.background-glass {
		filter: blur(30px);
		position: absolute;
		inset: 0;
		overflow: hidden;
		opacity: 0.12;
		z-index: 0;
		:global(img) {
			object-fit: cover;
			height: 100%;
		}
	}
	article :global(.post-card-content) {
		position: relative;
		z-index: 1;
	}
</style>

<article
	class="post pb-4"
	use:weakOnClick={{ onClick: dispatchOverlay, enabled: supportsOverlay }}
	bind:this={articleEl}
>
	<Stack dir="c" gap={2} cl="card post-preview-card">
		{#if $postCardLayoutFrostedGlassBackground && postAssertions.imageSrc && !postView.post.nsfw}
			<div class="background-glass" inert>
				<Image mode="thumbnail" src={postAssertions.imageSrc} thumbnailResolution={32} lazy={false} />
			</div>
		{/if}
		<Stack dir="c" gap={2} cl="post-card-content">
			<div class="responsive-text px-2 pt-2">
				<Stack dir="r" gap={1} align="start" justify="between" cl="f-wrap">
					<Stack dir="r" gap={1} align="center" cl="f-wrap">
						<slot name="creator" />
						to
						<slot name="community" />
					</Stack>

					<Stack dir="r" gap={1} align="start" cl="f-wrap">
						<PostTime {postView} />
					</Stack>
				</Stack>
			</div>

			<div class="px-2">
				<PostTitle {postView} on:overlay modeList={true} {supportsOverlay} />
			</div>

			{#if postAssertions.has.image}
				<div class="card-image">
					<CardPostImage {postView} />
				</div>
			{/if}

			{#if postView.post.embed_description || (postView.post.embed_title && mode === 'list')}
				<div class="px-2">
					<PostEmbed {postView} reflectRead preview />
				</div>
			{:else if postAssertions.is.externalLink}
				<div class="px-2">
					<slot name="post-link" />
				</div>
			{/if}

			{#if mode === 'list' && postAssertions.has.body}
				<div class="px-2">
					<PostBody {postView} preview reflectRead dedupeEmbed />
				</div>
			{/if}
			<Stack dir="r" gap={2} align="center" justify="between" cl="px-2 pb-2">
				{#if $postCardLayoutLeftAlignedButtons}
					<slot name="vote-buttons" small={false} dir="row" />
				{/if}
				<Stack dir="r" gap={1} align="center" cl="responsive-text">
					<slot name="embed-expand" />
					<slot name="actions" />
				</Stack>
				{#if !$postCardLayoutLeftAlignedButtons}
					<slot name="vote-buttons" small={false} dir="row" />
				{/if}
			</Stack>
		</Stack>
	</Stack>
</article>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import PostTitle from '../PostTitle.svelte';
	import CardPostImage from './CardPostImage.svelte';
	import PostTime from '../PostTime.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { PostView } from 'lemmy-js-client';
	import { makePostAssertions } from '../post-utils';
	import { weakOnClick } from '$lib/utils';
	import PostBody from './PostBody.svelte';
	import PostEmbed from '../PostEmbed.svelte';
	import { getSettingsContext } from '$lib/settings-context';
	import Image from '$lib/Image.svelte';

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	function dispatchOverlay() {
		dispatch('overlay', postView.post.id);
	}

	export let postView: PostView;
	export let supportsOverlay = true;
	export let mode: 'show' | 'list' = 'list';

	let articleEl: HTMLElement;

	const { postCardLayoutLeftAlignedButtons, postCardLayoutFrostedGlassBackground } = getSettingsContext();

	$: postAssertions = makePostAssertions(postView);
</script>
