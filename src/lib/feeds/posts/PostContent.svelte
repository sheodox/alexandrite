<style>
	.embed-content {
		width: 60rem;
		max-width: 100%;
	}
</style>

<div class="embed-content f-column gap-2">
	<PostEmbed {postView} />
	{#if postAssertions.has.body}
		<PostBody {postView} />
	{/if}
	{#if probablyImage && postView.post.url}
		<!-- not passing nsfw, it's handled by not showing the post contents
		by default when necessary, or the user has to click twice to see.
		also don't lazy load, as if it's expanded in the feed it has repercussions
		in the feed height, so images can't be lazy -->
		<Image src={postView.post.url} lazy={false} />
	{/if}
	{#if postAssertions.has.video}
		<!-- not passing nsfw, it's handled by not showing the post contents
		by default when necessary, or the user has to click twice to see.
		also don't lazy load, as if it's expanded in the feed it has repercussions
		in the feed height, so images can't be lazy -->
		<Video
			src={postAssertions.videoSrc || ''}
			linkTitle={postView.post.embed_title || postView.post.name}
			link={postView.post.url || ''}
		/>
	{/if}
</div>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import PostBody from './previews/PostBody.svelte';
	import Image from '$lib/Image.svelte';
	import Video from '$lib/Video.svelte';
	import PostEmbed from './PostEmbed.svelte';
	import { hasImageExtension, makePostAssertions } from './post-utils';

	export let postView: PostView;

	$: probablyImage = hasImageExtension(postView.post.url || '');
	$: postAssertions = makePostAssertions(postView);
</script>
