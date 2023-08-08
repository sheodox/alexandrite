<style lang="scss">
	.post {
		container-type: inline-size;
	}
	.embed-content {
		width: 60rem;
		max-width: 100%;
	}

	button,
	.button {
		margin: 0;
	}
	@container (width < 600px) {
		.post-stuff {
			flex-direction: column;
			align-items: start;
		}
	}
</style>

<article class="post px-2 f-row align-items-center post-mode-{mode}">
	<Stack dir="c" gap={2} cl="w-100 py-1">
		<div class="f-row gap-3 align-items-center post-stuff">
			<Stack dir="r" gap={2} align="center">
				<slot name="vote-buttons" small={false} dir="column" />
				{#if supportsOverlay}
					<button class="m-0 p-0" on:click={() => dispatch('overlay', postView.post.id)}
						><PostThumbnail {postView} /></button
					>
				{:else}
					<PostThumbnail {postView} />
				{/if}
			</Stack>
			<Stack dir="c" gap={2}>
				<PostTitle {postView} on:overlay modeList={true} {supportsOverlay} />
				<slot name="post-link" />
				<Stack dir="r" gap={1} align="start" cl="f-wrap">
					<slot name="creator" />
					to
					<slot name="community" />
				</Stack>
				<Stack dir="r" gap={2} align="center">
					<slot name="embed-expand" />
					<slot name="actions" />
					<PostTime {postView} />
				</Stack>
			</Stack>
		</div>
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

	export let postView: PostView;
	export let mode: 'show' | 'list' = 'list';
	export let supportsOverlay = true;
</script>
