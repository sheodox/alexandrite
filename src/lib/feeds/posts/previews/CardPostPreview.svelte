<style>
	article {
		width: 50rem;
		max-width: 100%;
		margin: 0 auto;
	}
	.post :global(.card) {
		overflow: hidden;
		border: 1px solid var(--sx-gray-transparent);
	}
	.embed-preview {
		max-height: 10rem;
		overflow: hidden;
	}
	@media (max-width: 600px) {
		.mobile-shrink {
			font-size: var(--sx-font-size-2) !important;
		}
	}
</style>

<article class="post pb-4">
	<Stack dir="c" gap={2} cl="card">
		{#if postAssertions.has.image}
			<div class="card-image">
				{#if supportsOverlay}
					<button class="m-0 p-0 align-self-center w-100" on:click={() => dispatch('overlay', postView.post.id)}
						><CardPostImage {postView} /></button
					>
				{:else}
					<CardPostImage {postView} />
				{/if}
			</div>
		{/if}
		<Stack dir="c" gap={2} cl="px-2 {postAssertions.has.image ? '' : 'pt-2'}">
			<div class="mobile-shrink">
				<Stack dir="r" gap={1} align="start" justify="between" cl="f-wrap">
					<Stack dir="r" gap={1} align="start" cl="f-wrap">
						<slot name="creator" />
						to
						<slot name="community" />
					</Stack>

					<Stack dir="r" gap={1} align="start" cl="f-wrap">
						<PostTime {postView} />
					</Stack>
				</Stack>
			</div>

			<PostTitle {postView} on:overlay modeList={true} {supportsOverlay} />

			{#if postView.post.embed_description}
				<p class="m-0 card card-body embed-preview mobile-shrink" class:muted={postView.read}>
					<span class="muted fw-bold embed-title-hint">
						<span class="muted">
							<Icon icon="quote-left" />
						</span>
						<slot name="post-link" />
					</span>
					<br />
					{postView.post.embed_description}
				</p>
			{:else}
				<slot name="post-link" />
			{/if}

			{#if postAssertions.has.body}
				<div class="card card-body embed-preview mobile-shrink" class:muted={postView.read}>
					<span class="muted fw-bold embed-title-hint sx-font-size-2"><Icon icon="quote-left" /> Post</span>
					<br />
					<Markdown noImages md={postView.post.body ?? ''} />
				</div>
			{/if}
			<Stack dir="r" gap={2} align="center" justify="between">
				<Stack dir="r" gap={1} align="center">
					<slot name="embed-expand" />
					<slot name="actions" />
				</Stack>
				<slot name="vote-buttons" small={false} dir="row" />
			</Stack>
		</Stack>
	</Stack>
</article>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import PostTitle from '../PostTitle.svelte';
	import CardPostImage from './CardPostImage.svelte';
	import PostTime from '../PostTime.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { PostView } from 'lemmy-js-client';
	import { makePostAssertions } from '../post-utils';
	import Markdown from '$lib/Markdown.svelte';

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	export let postView: PostView;
	export let supportsOverlay = true;

	$: postAssertions = makePostAssertions(postView);
</script>
