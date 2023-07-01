<style lang="scss">
	$sidebarWidth: 30rem;
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
		width: calc(100% - #{$sidebarWidth});
	}
	.comment-editor {
		width: 60rem;
		max-width: 100%;
	}
	aside {
		background-color: var(--sx-gray-800);
		width: #{$sidebarWidth};
		padding: 1rem;
		overflow: auto;
		position: fixed;
		top: 0;
		padding-top: 50px;
		height: 100vh;
		right: 0;
	}
</style>

<div>
	<article class="f-column p-4 f-1 post">
		<div class="ml-6 mb-1">
			<Breadcrumbs {links} linkifyLast />
		</div>
		<Post {postView} mode="show" on:update-post-view {showPost}>
			<Stack dir="r" slot="beforeEmbed" let:hasEmbeddableContent>
				<a href="#comments" class="button tertiary"><Icon icon="chevron-down" />To Comments</a>
				{#if hasEmbeddableContent}
					<button class="tertiary" on:click={() => (showPost = !showPost)}
						><Icon icon="comments" iconVariant="regular" />{showPost ? 'Hide' : 'Show'} Content</button
					>
				{/if}
			</Stack>
		</Post>

		<hr class="w-100" id="comments" />

		{#if loggedIn}
			<div class="comment-editor m-2">
				<Accordion bind:open={showCommentComposer} buttonClasses="tertiary">
					<span slot="title">Leave a comment</span>
					{#key showCommentComposer}
						<form
							action="/post/{postView.post.id}/?/postComment"
							on:submit={() => {
								submittingComment = true;
							}}
							use:enhance={addCommentEnhance}
							method="POST"
						>
							<CommentEditor submitting={submittingComment} />
						</form>
					{/key}
				</Accordion>
			</div>
		{/if}

		<h2 class="px-4 mt-6 mb-0">Comments ({postView.counts.comments})</h2>
		<section>
			<Stack gap={4} align="center" cl="p-4" dir="r">
				<ToggleGroup options={CommentSortOptions} bind:selected={selectedSort} name="sort" on:change={changeSort} />
			</Stack>
		</section>

		{#if viewingSingleCommentThread}
			<Stack dir="r" gap={2} align="center" cl="p-4">
				<a href="/post/{postView.post.id}" class="button secondary"
					><Icon icon="arrow-up-from-bracket" variant="icon-only" />
					View all comments
				</a>
				{#if rootComment && commentContextId !== rootComment.comment.id}
					<a href="/comment/{commentContextId}" class="button secondary">
						Parent comment
						<Icon icon="turn-up" variant="icon-only" />
					</a>
				{/if}
			</Stack>
		{/if}
		{#if commentViews}
			<CommentTree
				{rootCommentId}
				{commentViews}
				postOP={postView.creator.actor_id}
				on:more={loadNextCommentPage}
				on:expand={expandComment}
				on:new-comment={onNewComment}
				on:update-comment={onUpdateComment}
				on:more={loadNextCommentPage}
				endOfFeed={endOfCommentsFeed}
				loadingContentFailed={commentLoadFailed}
				loadingContent={loadingComments}
				feedEndMessage="No more comments"
				feedEndIcon="comment-slash"
				expandLoadingIds={Array.from(commentExpandLoadingIds)}
			/>
		{/if}
	</article>
	<aside>
		<CommunitySidebar community={postView.community} />
	</aside>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { Stack, Icon, Breadcrumbs, Accordion } from 'sheodox-ui';
	import Post from '$lib/feeds/posts/Post.svelte';
	import CommentTree from '$lib/CommentTree.svelte';
	import CommunitySidebar from './CommunitySidebar.svelte';
	import type { CommentView, PostView } from 'lemmy-js-client';
	import { CommentSortOptions } from './feed-filters';
	import ToggleGroup from './ToggleGroup.svelte';
	import CommentEditor from './CommentEditor.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { getAppContext } from './app-context';
	import { getCommentContextId, nameAtInstance } from './nav-utils';

	export let postView: PostView;
	export let commentViews: CommentView[] = [];
	export let rootCommentId: null | number = null;
	let commentExpandLoadingIds = new Set<number>();
	$: viewingSingleCommentThread = rootCommentId !== null;
	$: rootComment = viewingSingleCommentThread ? commentViews.find((cv) => cv.comment.id === rootCommentId) : null;
	$: commentContextId = rootComment ? getCommentContextId(rootComment) : null;

	const { loggedIn } = getAppContext();

	let commentsPageNum = 1,
		selectedSort = 'Hot',
		loadingComments = false,
		// assume if they came here following a comment link, commenting on the post is less important
		showCommentComposer = rootCommentId === null,
		showPost = rootCommentId === null,
		commentLoadFailed = false,
		endOfCommentsFeed = false,
		submittingComment = false;

	function changeSort() {
		// start over if sorting changes
		commentsPageNum = 1;
		endOfCommentsFeed = false;
		commentViews = [];
		loadNextCommentPage();
	}

	const addCommentEnhance: SubmitFunction<{ commentView: CommentView }> = () => {
		return async ({ update, result }) => {
			await update();
			submittingComment = false;

			if (result.type === 'success' && result.data) {
				commentViews.unshift(result.data.commentView);
				commentViews = commentViews;
				showCommentComposer = false;
			}
		};
	};

	function onNewComment(e: CustomEvent<CommentView>) {
		commentViews.push(e.detail);
		commentViews = commentViews;
	}

	function onUpdateComment(e: CustomEvent<CommentView>) {
		const index = commentViews.findIndex((cv) => cv.comment.id === e.detail.comment.id);
		if (index >= 0) {
			commentViews[index] = e.detail;
			commentViews = commentViews;
		}
	}

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
		// when viewing a single comment thread, we don't want to load more comments
		if (viewingSingleCommentThread) {
			return;
		}

		const { comments, busy, error } = await loadComments(
			`/api/posts/${postView.post.id}/comments?page=${commentsPageNum++}&sort=${selectedSort}`
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
		commentExpandLoadingIds.add(e.detail);
		commentExpandLoadingIds = commentExpandLoadingIds;
		await loadComments(`/api/posts/${postView.post.id}/comments?parentId=${e.detail}`);
		commentExpandLoadingIds.delete(e.detail);
		commentExpandLoadingIds = commentExpandLoadingIds;
	}

	onMount(() => {
		loadNextCommentPage();
	});

	$: communityName = nameAtInstance(postView.community);
	$: links = [
		{
			text: 'Home',
			href: '/'
		},
		{
			text: communityName,
			href: `/c/${communityName}/`
		}
	];
</script>
