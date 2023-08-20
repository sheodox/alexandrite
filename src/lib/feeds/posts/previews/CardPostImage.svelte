<style lang="scss">
	.card-image-placeholder {
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

<div class="card-image" class:nsfw={isNsfw}>
	{#if (postView.post.nsfw || postView.community.nsfw) && $nsfwImageHandling === 'HIDE' && !showAnyway}
		<div class="card-image-placeholder">
			<button class="tertiary" on:click|stopPropagation={() => (showAnyway = true)}> Show NSFW </button>
		</div>
	{:else if postAssertions.imageSrc}
		<!-- not passing nsfw when handling='show' this component handles it otherwise we'd have nested buttons,
		but we need to still tell it when it needs to blur otherwise you see unblurred nsfw content -->
		<Image
			src={postAssertions.imageSrc}
			full
			resizable={false}
			lazy={false}
			loadingHeight="20rem"
			nsfw={$nsfwImageHandling === 'BLUR' && isNsfw}
		/>
	{/if}
</div>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import Image from '$lib/Image.svelte';
	import { getSettingsContext } from '$lib/settings-context';
	import { makePostAssertions } from '../post-utils';

	export let postView: PostView;

	const { nsfwImageHandling } = getSettingsContext();

	let showAnyway = false;
	$: postAssertions = makePostAssertions(postView);
	$: isNsfw = postView.post.nsfw || postView.community.nsfw;
</script>
