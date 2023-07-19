<style lang="scss">
	@use 'sass:math';

	$height: 6rem;
	$aspect: math.div(16, 9);
	.thumbnail {
		background: var(--sx-gray-transparent);
		border-radius: 5px;
		overflow: hidden;
		flex-shrink: 0;
		height: #{$height};
		width: #{$height * $aspect};

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

<div class="thumbnail">
	{#if thumbnailUrl}
		<Image src={thumbnailUrl} mode="thumbnail" nsfw={postView.post.nsfw} />
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
	$: thumbnailUrl = postView.post.thumbnail_url;
</script>
