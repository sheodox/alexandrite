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
		width: 100%;
		right: 0;
		position: absolute;
		overflow: auto;
		background: var(--sx-gray-700);
	}
	.close-bg {
		background: var(--sx-gray-transparent-darker);
		cursor: zoom-out;
	}
	@media (min-width: 800px) {
		.post-container {
			width: 75vw;
			border-left: 2px solid var(--sx-gray-400);
		}
	}
</style>

<Portal>
	<div class="post-overlay">
		<div class="close-bg" on:click={close} aria-hidden />
		<div class="post-container f-column" transition:fly|global={{ x: 20, duration: 100 }}>
			<PostPage {postView} closeable on:close />
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
