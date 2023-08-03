<style lang="scss">
	a {
		transition: color 0.1s;
		color: var(--sx-gray-25);
		&:hover {
			color: white !important;
		}
	}
	a.read {
		color: var(--sx-gray-200);
	}
</style>

<Stack dir="r" gap={2} align="center">
	<a
		href="/{$profile.instance}/post/{postView.post.id}"
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
	import { profile } from '$lib/profiles/profiles';

	const dispatch = createEventDispatcher<{
		overlay: number;
	}>();

	export let postView: PostView;
	export let modeList: boolean;
	export let supportsOverlay: boolean;

	function titleClick(e: MouseEvent) {
		// users can normally ctrl+click links to oppen in a new tab, don't interfere with that!
		if (e.ctrlKey || e.metaKey) {
			return;
		}

		if (supportsOverlay) {
			e.preventDefault();
			dispatch('overlay', postView.post.id);
		}
	}
</script>
