<style lang="scss">
	hr {
		border-color: var(--sx-gray-transparent-lighter);
	}
	aside {
		background-color: var(--sx-gray-800);
		width: 30rem;
		padding: 1rem;
		min-height: 100vh;
	}
	article.post {
		margin: 0 auto;
	}
</style>

<Stack dir="r" cl="f-1">
	<article class="f-column p-4 f-1 post">
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
	</article>
	<aside>
		<article>
			<Sidebar name={'!' + nameAtInstance(postView.community)} description={postView.community.description ?? ''} />
		</article>
	</aside>
</Stack>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Stack, Loading, Icon } from 'sheodox-ui';
	import Post from '$lib/feeds/posts/Post.svelte';
	import CommentTree from '$lib/CommentTree.svelte';
	import Sidebar from '$lib/Sidebar.svelte';
	import type { CommentView, PostView } from 'lemmy-js-client';
	import { nameAtInstance } from '$lib/nav-utils';

	export let postView: PostView;
	let commentViews: CommentView[];

	let pageNum = 1;
	async function loadNextCommentPage() {
		const cvs = (await fetch(`/api/comments/${postView.post.id}?page=${pageNum++}`).then((res) => res.json())).comments;
		commentViews = [...(commentViews || []), ...cvs];
	}

	onMount(() => {
		loadNextCommentPage();
	});
</script>
