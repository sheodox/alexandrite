<style lang="scss">
	article {
		width: 50rem;
		max-width: 100%;
		margin: 0 auto;
	}

	article:focus {
		outline: none;

		:global(.post-preview-card) {
			outline: 2px solid var(--sx-input-focus-color);
			outline-offset: 2px;
		}
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

<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
<article
	class="post pb-4"
	use:weakOnClick={{ onClick: dispatchOverlay, enabled: supportsOverlay }}
	bind:this={articleEl}
>
	<Stack dir="c" gap={2} cl="card post-preview-card">
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
					<CardPostImage {postView} />
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
	import { weakOnClick } from '$lib/utils';
	import Markdown from '$lib/Markdown.svelte';
	import PostEmbed from '../PostEmbed.svelte';

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	function dispatchOverlay() {
		dispatch('overlay', postView.post.id);
	}

	export let postView: PostView;
	export let supportsOverlay = true;

	let articleEl: HTMLElement;

	$: postAssertions = makePostAssertions(postView);
</script>
