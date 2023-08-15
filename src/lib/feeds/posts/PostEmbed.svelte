<style>
	.card {
		border: 1px solid var(--sx-gray-transparent);
	}
	.preview {
		max-height: 10rem;
		overflow: hidden;
	}
	div.read {
		color: var(--sx-muted);
	}
</style>

{#if hasEmbedText}
	<div class="m-0 card embed-preview responsive-text" class:read={postView.read && reflectRead} class:preview>
		<p class="card-body m-0">
			{#if postView.post.embed_title}
				<span class="muted fw-bold embed-title-hint">
					<span class="muted">
						<Icon icon="quote-left" />
					</span>
					{postView.post.embed_title}
				</span>
				<br />
			{/if}
			{#if postAssertions.is.externalLink && postView.post.url}
				<PrettyExternalLink href={postView.post.url} />
			{/if}
			<br />
			{postView.post.embed_description ?? ''}
		</p>
	</div>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import type { PostView } from 'lemmy-js-client';
	import PrettyExternalLink from '$lib/PrettyExternalLink.svelte';
	import { makePostAssertions } from './post-utils';

	export let postView: PostView;
	// if the text should be dimmed if the post has been read
	export let reflectRead = false;
	// if this is meant to just be a preview of the embed content, sets a max height
	export let preview = false;

	$: hasEmbedText = postView.post.embed_title || postView.post.embed_description;

	$: postAssertions = makePostAssertions(postView);
</script>
