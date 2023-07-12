<style>
	a.read {
		color: var(--sx-gray-200);
	}
</style>

<Stack dir="r" gap={2} align="center">
	<a
		href="/post/{postView.post.id}"
		on:click={titleClick}
		class="sx-font-size-5 post-title"
		data-sveltekit-preload-data="off"
		class:read={postView.read && modeList}>{postView.post.name}</a
	>
	<PostBadges {postView} />
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import PostBadges from '$lib/PostBadges.svelte';
	import type { PostView } from 'lemmy-js-client';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		overlay: number;
	}>();

	export let postView: PostView;
	export let modeList: boolean;
	export let supportsOverlay: boolean;

	function titleClick(e: Event) {
		if (supportsOverlay) {
			e.preventDefault();
			openOverlay();
		}
	}

	function openOverlay() {
		dispatch('overlay', postView.post.id);
	}
</script>
