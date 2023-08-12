<style lang="scss">
	.card-video-placeholder {
		height: 20rem;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.nsfw {
		background: var(--sx-red-transparent-faint);
		button {
			height: 100%;
			width: 100%;
			margin: 0;
		}
	}
</style>

<div class="card-video" class:nsfw={postView.post.nsfw}>
	{#if postView.post.nsfw && $nsfwImageHandling === 'HIDE' && !showAnyway}
		<div class="card-video-placeholder">
			<button class="tertiary" on:click|stopPropagation={() => (showAnyway = true)}> Show NSFW </button>
		</div>
	{:else if postAssertions.has.video}
		<!-- not passing nsfw, this component handles it otherwise we'd have nested buttons -->
		<Video
			src={postAssertions.videoSrc || ''}
			full
			loadingHeight="20rem"
			linkTitle={postView.post.embed_title || postView.post.name}
			link={postView.post.url || ''}
		/>
	{/if}
</div>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import Video from '$lib/Video.svelte';
	import { getSettingsContext } from '$lib/settings-context';
	import { makePostAssertions } from '../post-utils';

	export let postView: PostView;

	const { nsfwImageHandling } = getSettingsContext();

	let showAnyway = false;
	$: postAssertions = makePostAssertions(postView);
</script>
