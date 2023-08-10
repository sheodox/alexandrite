<style>
	.card {
		border: 1px solid var(--sx-gray-transparent);
	}
	.preview {
		max-height: 10rem;
		overflow: hidden;
	}
</style>

{#if postAssertions.has.body && (!dedupeEmbed || postView.post.body !== postView.post.embed_description)}
	<div class="card m-0">
		<div class="card-body embed-preview responsive-text" class:muted={postView.read && reflectRead} class:preview>
			<span class="muted fw-bold embed-title-hint sx-font-size-2"><Icon icon="quote-left" /> Post</span>
			<br />
			<Markdown noImages md={postView.post.body ?? ''} />
		</div>
	</div>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import Markdown from '$lib/Markdown.svelte';
	import type { PostView } from 'lemmy-js-client';
	import { makePostAssertions } from '../post-utils';

	export let postView: PostView;
	export let preview = false;
	// if the post body matches the embed description, don't show the post body
	export let dedupeEmbed = false;
	// if the text should be dimmed if the post has been read
	export let reflectRead = false;

	$: postAssertions = makePostAssertions(postView);
</script>
