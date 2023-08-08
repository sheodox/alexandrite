<style lang="scss">
	.embed-content {
		width: 60rem;
		max-width: 100%;
	}

	button,
	.button {
		margin: 0;
	}
	.compact-post {
		border-bottom: 1px solid var(--sx-gray-400);
	}
</style>

<article class="compact-post px-2 f-row align-items-center post-mode-{mode}">
	<Stack dir="r" gap={2} align="center">
		<slot name="vote-buttons" small={true} dir="column" />
		{#if supportsOverlay}
			<button class="m-0 p-0" on:click={() => dispatch('overlay', postView.post.id)}
				><PostThumbnail {postView} height={thumbnailHeight} /></button
			>
		{:else}
			<PostThumbnail {postView} height={thumbnailHeight} />
		{/if}
		<Stack dir="c" gap={1}>
			<PostTitle {postView} on:overlay modeList={true} {supportsOverlay} cl="sx-font-size-4" />
			<span class="sx-font-size-2">
				<slot name="post-link" />
			</span>
			<Stack dir="r" gap={1} align="start" cl="f-wrap sx-font-size-2">
				<slot name="creator" />
				to
				<slot name="community" />
			</Stack>
			<Stack dir="r" gap={1} align="center">
				<slot name="embed-expand" />
				<slot name="actions" />
				<PostTime {postView} />
			</Stack>
		</Stack>
	</Stack>
</article>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import PostTitle from '../PostTitle.svelte';
	import PostThumbnail from '../PostThumbnail.svelte';
	import PostTime from '../PostTime.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { PostView } from 'lemmy-js-client';

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	const thumbnailHeight = '4rem';

	export let postView: PostView;
	export let mode: 'show' | 'list' = 'list';
	export let supportsOverlay = true;
</script>
