<EmbedCard
	title={postView.post.embed_title}
	description={postView.post.embed_description}
	read={postView.read}
	{reflectRead}
	{preview}
	externalLink={postAssertions.is.externalLink ? postView.post.url : undefined}
/>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import EmbedCard from './EmbedCard.svelte';
	import { makePostAssertions } from './post-utils';

	export let postView: PostView;
	// if the text should be dimmed if the post has been read
	export let reflectRead = false;
	// if this is meant to just be a preview of the embed content, sets a max height
	export let preview = false;

	$: postAssertions = makePostAssertions(postView);
</script>
