<style lang="scss">
	.thumbnail {
		background: var(--sx-gray-transparent);
		border-radius: 5px;
		overflow: hidden;
		flex-shrink: 0;
		height: var(--thumbnail-height);
		width: calc(var(--thumbnail-height) * (16 / 9));

		:global(img),
		:global(.img) {
			height: 100%;
			width: 100%;
			object-fit: cover;
		}
		:global(.sx-stack) {
			height: 100%;
			width: 100%;
		}
	}
</style>

<div class="thumbnail" style="--thumbnail-height: {height};">
	{#if thumbnailUrl}
		<Image src={thumbnailUrl} mode="thumbnail" nsfw={postView.post.nsfw || postView.community.nsfw} />
	{:else}
		<!-- only showing the placeholder thumbnail if that's the orientation -->
		<Stack justify="center" align="center">
			<Icon icon={postView.post.url ? 'arrow-up-right-from-square' : 'comments'} />
		</Stack>
	{/if}
</div>

<script lang="ts">
	import type { PostReportView, PostView } from 'lemmy-js-client';
	import { Stack, Icon } from 'sheodox-ui';
	import Image from '$lib/Image.svelte';

	export let postView: PostView | PostReportView;
	export let height = '6rem';

	$: thumbnailUrl = postView.post.thumbnail_url;
</script>
