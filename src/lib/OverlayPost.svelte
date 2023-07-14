<style lang="scss">
	.post-overlay,
	.close-bg {
		position: fixed;
		inset: 0;
		top: var(--app-header-height);
	}
	.post-overlay {
		z-index: 1000;
	}
	.post-container {
		height: 100%;
		width: 75vw;
		right: 0;
		position: absolute;
		overflow: auto;
		background: var(--sx-gray-700);
		border-left: 1px solid var(--sx-gray-400);
	}
	.close-bg {
		background: var(--sx-gray-transparent-darker);
		cursor: zoom-out;
	}
</style>

<Portal>
	<div class="post-overlay">
		<div class="close-bg" on:click={close} aria-hidden />
		<div class="post-container virtual-feed-scroll-container f-column" transition:fly|global={{ x: 20, duration: 100 }}>
			<PostPage {postView} />
		</div>
	</div>
</Portal>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { Portal } from 'sheodox-ui';
	import PostPage from './PostPage.svelte';
	import type { PostView } from 'lemmy-js-client';
	const dispatch = createEventDispatcher<{ close: void }>();

	export let postView: PostView;

	function close() {
		dispatch('close');
	}
	onMount(() => {
		document.body.style.overflow = 'hidden';
	});
	onDestroy(() => {
		document.body.style.overflow = 'auto';
	});
</script>
