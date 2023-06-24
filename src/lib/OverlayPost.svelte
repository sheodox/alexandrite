<style lang="scss">
	.post-overlay,
	.close-bg {
		position: fixed;
		inset: 0;
	}
	.post-overlay {
		z-index: 1000;
	}
	.post-container {
		height: 100vh;
		width: 75vw;
		right: 0;
		position: absolute;
		overflow: auto;
		background: var(--sx-gray-600);
		border-left: 1px solid var(--sx-gray-400);
	}
	.close-bg {
		background: var(--sx-gray-transparent-darker);
		cursor: zoom-out;
	}
	hr {
		border-color: var(--sx-gray-transparent-lighter);
	}
	aside {
		background-color: var(--sx-gray-800);
		width: 30rem;
		padding: 1rem;
		min-height: 100vh;
	}
</style>

<Portal>
	<div class="post-overlay">
		<div class="close-bg" on:click={close} aria-hidden />
		<div class="post-container f-column">
			<Stack dir="r" cl="f-1">
				<Stack dir="c" cl="p-4 f-1">
					<Post {postView} mode="show">
						<Stack dir="r" slot="beforeEmbed">
							<a href="#comments" class="button tertiary"><Icon icon="comments" iconVariant="regular" />To Comments</a>
						</Stack>
					</Post>

					<hr class="w-100" />

					{#if commentViews}
						<h2 class="px-4 mt-6" id="comments">Comments ({commentViews.length})</h2>
						<CommentTree {commentViews} postOP={postView.creator.actor_id} />
					{:else}
						<Stack align="center" justify="center" cl="f-1">
							<Loading />
						</Stack>
					{/if}
				</Stack>
				<aside>
					<article>
						<Sidebar
							name={'!' + nameAtInstance(postView.community)}
							description={postView.community.description ?? ''}
						/>
					</article>
				</aside>
			</Stack>
		</div>
	</div>
</Portal>

<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { Portal, Stack, Loading, Icon } from 'sheodox-ui';
	import Post from '$lib/feeds/posts/Post.svelte';
	import CommentTree from '$lib/CommentTree.svelte';
	import Sidebar from '$lib/Sidebar.svelte';
	import type { CommentView, PostView } from 'lemmy-js-client';
	import { nameAtInstance } from '$lib/nav-utils';
	const dispatch = createEventDispatcher<{ close: void }>();

	export let postView: PostView;
	let commentViews: CommentView[];

	let pageNum = 1;
	async function loadNextCommentPage() {
		const cvs = (await fetch(`/api/comments/${postView.post.id}?page=${pageNum++}`).then((res) => res.json())).comments;
		commentViews = [...(commentViews || []), ...cvs];
	}

	function close() {
		dispatch('close');
	}
	onMount(() => {
		document.body.style.overflow = 'hidden';
		loadNextCommentPage();
	});
	onDestroy(() => {
		document.body.style.overflow = 'auto';
	});
</script>
