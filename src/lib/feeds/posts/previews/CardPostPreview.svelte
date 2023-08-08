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
</style>

<article class="post pb-4">
	<Stack dir="c" gap={2} cl="card">
		<Stack dir="c" gap={2}>
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
					{#if supportsOverlay}
						<button class="m-0 p-0 align-self-center w-100" on:click={() => dispatch('overlay', postView.post.id)}
							><CardPostImage {postView} /></button
						>
					{:else}
						<CardPostImage {postView} />
					{/if}
				</div>
			{/if}

			{#if postView.post.embed_description || postView.post.embed_title}
				<div class="px-2">
					<PostEmbed {postView} reflectRead preview />
				</div>
			{:else if postAssertions.is.externalLink}
				<div class="px-2">
					<slot name="post-link" />
				</div>
			{/if}

			{#if postAssertions.has.body && postView.post.body !== postView.post.embed_description}
				<div class="card card-body mx-2 embed-preview responsive-text" class:muted={postView.read}>
					<span class="muted fw-bold embed-title-hint sx-font-size-2"><Icon icon="quote-left" /> Post</span>
					<br />
					<Markdown noImages md={postView.post.body ?? ''} />
				</div>
			{/if}
			<Stack dir="r" gap={2} align="center" justify="between" cl="px-2">
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
	import PostEmbed from '../PostEmbed.svelte';

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	export let postView: PostView;
	export let supportsOverlay = true;

	$: postAssertions = makePostAssertions(postView);
</script>
