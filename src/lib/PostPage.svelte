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

		<h2 class="px-4 mt-6" id="comments">Comments ({postView.counts.comments})</h2>
		{#if commentViews}
			<CommentTree
				{commentViews}
				postOP={postView.creator.actor_id}
				on:more={loadNextCommentPage}
				on:expand={expandComment}
			/>
			<InfiniteFeed
				on:more={loadNextCommentPage}
				endOfFeed={endOfCommentsFeed}
				loadMoreFailed={commentLoadFailed}
				loading={loadingComments}
				feedEndMessage="No more comments"
				feedEndIcon="comment-slash"
			/>
		{:else}
			<Stack align="center" justify="center" cl="f-1">
				<Loading />
			</Stack>
		{/if}
	</article>
	<aside>
		<CommunitySidebar community={postView.community} />
	</aside>
</Stack>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Stack, Loading, Icon } from 'sheodox-ui';
	import Post from '$lib/feeds/posts/Post.svelte';
	import CommentTree from '$lib/CommentTree.svelte';
	import CommunitySidebar from './CommunitySidebar.svelte';
	import InfiniteFeed from './feeds/posts/InfiniteFeed.svelte';
	import type { CommentView, PostView } from 'lemmy-js-client';

	export let postView: PostView;
	let commentViews: CommentView[];

	let commentsPageNum = 1,
		loadingComments = false,
		commentLoadFailed = false,
		endOfCommentsFeed = false;

	function mergeNewCommentViews(nextPage: CommentView[]): number {
		if (!commentViews) {
			commentViews = nextPage;
			return commentViews.length;
		}

		const newCommentViews = nextPage.filter((c1) => !commentViews.some((c2) => c2.comment.id === c1.comment.id));

		commentViews = [...commentViews, ...newCommentViews];

		return newCommentViews.length;
	}

	async function loadComments(url: string): Promise<{ comments: number; busy: boolean; error: boolean }> {
		if (loadingComments) {
			return { comments: 0, busy: true, error: false };
		}

		loadingComments = true;

		try {
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error('Failed to load comments');
			}
			const cvs = (await res.json()).comments;
			return {
				comments: mergeNewCommentViews(cvs),
				busy: false,
				error: false
			};
		} catch (e) {
			// todo show an error message
			console.log(e);
		} finally {
			loadingComments = false;
		}

		// failed to load
		return { comments: 0, busy: false, error: true };
	}

	async function loadNextCommentPage() {
		const { comments, busy, error } = await loadComments(
			`/api/posts/${postView.post.id}/comments?page=${commentsPageNum++}`
		);
		commentLoadFailed = error;

		if (!busy && comments === 0) {
			endOfCommentsFeed = true;
		}
		if (error) {
			commentLoadFailed = true;
			// revert to the failed page, so it can be retried
			commentsPageNum--;
		}
	}

	async function expandComment(e: CustomEvent<number>) {
		loadComments(`/api/posts/${postView.post.id}/comments?parentId=${e.detail}`);
	}

	onMount(() => {
		loadNextCommentPage();
	});
</script>
