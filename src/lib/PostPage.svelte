<style lang="scss">
	$sidebarWidth: 30rem;
	hr {
		border-color: var(--sx-gray-transparent-lighter);
	}
	.page-column-sidebar {
		background-color: var(--sx-gray-800);
		width: 30rem;
		padding: 1rem;
		border-left: 1px solid var(--sx-gray-transparent-light);
		background-color: var(--sx-gray-800);
		width: #{$sidebarWidth};
		padding: 1rem;
		overflow: auto;
	}

	section.post {
		margin: 0 auto;
	}
	.comment-editor,
	.comment-sort-bar {
		width: 60rem;
		max-width: 100%;
	}
	.sidebar-hidden .page-column-sidebar {
		display: none;
	}
	.page-column {
		overflow: auto;
		position: relative;
		max-height: calc(100vh - var(--app-header-height));
	}
	.post {
		background: var(--sx-gray-700);
		.post-layout-margin {
			margin: 0 auto;
		}
	}
	.post-page-root {
		position: relative;
	}
</style>

<div class:sidebar-hidden={!$sidebarVisible} class:sidebar-visible={$sidebarVisible} class="f-row post-page-root">
	<div class="page-column page-column-post virtual-feed-scroll-container f-1">
		<section class="f-column p-4 f-1 post">
			{#if closeable}
				<button on:click={() => dispatch('close')} class="tertiary m-4"
					><Icon icon="times" variant="icon-only" /> Close Post</button
				>
			{/if}
			<div class="ml-6 mb-1">
				<Breadcrumbs {links} linkifyLast />
			</div>
			<Post {postView} mode="show" on:update-post-view {showPost} size="full" supportsOverlay={false}>
				<Stack dir="r" slot="beforeEmbed" let:hasEmbeddableContent>
					<a href="#comments" class="button tertiary"
						><Icon icon="chevron-down" />To Comments ({postView.counts.comments})</a
					>
					{#if hasEmbeddableContent}
						<button class="tertiary" on:click={() => (showPost = !showPost)}
							><Icon icon="newspaper" />{showPost ? 'Hide' : 'Show'} Content</button
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
							<form bind:this={newCommentForm}>
								<CommentEditor submitting={$newCommentState.busy} bind:value={newCommentText} />
							</form>
						{/key}
					</Accordion>
				</div>
			{/if}

			<h2 class="px-4 mt-6 mb-0">Comments ({postView.counts.comments})</h2>
			<section class="comment-sort-bar">
				<Stack gap={4} dir="r" justify="between" align="center">
					<Stack gap={4} align="center" cl="p-4" dir="r">
						<ToggleGroup
							options={CommentSortOptions}
							bind:selected={selectedSort}
							name="sort"
							on:change={reloadComments}
						/>
						<Search bind:value={searchText} />
					</Stack>
					<button class="tertiary" on:click={reloadComments}
						><Icon icon="refresh" variant="icon-only" /> Refresh Comments</button
					>
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
					{searchText}
					postOP={postView.creator.actor_id}
					on:more={loadNextCommentPage}
					on:expand={expandComment}
					on:new-comment={onNewComment}
					on:update-comment={onUpdateComment}
					on:more={loadNextCommentPage}
					endOfFeed={endOfCommentsFeed || viewingSingleCommentThread}
					loadingContent={loadingComments}
					loadingContentFailed={commentLoadFailed}
					feedEndMessage="No more comments"
					feedEndIcon="comment-slash"
					expandLoadingIds={Array.from(commentExpandLoadingIds)}
				/>
			{/if}
		</section>
	</div>
	<div class="page-column page-column-sidebar virtual-feed-scroll-container">
		<aside>
			<CommunitySidebar community={postView.community} />
		</aside>
	</div>
</div>

<script lang="ts">
	import { Search, Stack, Icon, Breadcrumbs, Accordion } from 'sheodox-ui';
	import Post from '$lib/feeds/posts/Post.svelte';
	import CommentTree from '$lib/CommentTree.svelte';
	import CommunitySidebar from './CommunitySidebar.svelte';
	import type { CommentSortType, CommentView, PostView } from 'lemmy-js-client';
	import { CommentSortOptions } from './feed-filters';
	import ToggleGroup from './ToggleGroup.svelte';
	import CommentEditor from './CommentEditor.svelte';
	import { getAppContext } from './app-context';
	import { getCommentContextId, nameAtInstance } from './nav-utils';
	import { getLemmyClient } from './lemmy-client';
	import { createStatefulForm, type ActionFn } from './utils';
	import { getSettingsContext } from './settings-context';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ close: void }>();

	export let postView: PostView;
	export let initialCommentViews: CommentView[] = [];
	export let rootCommentId: null | number = null;
	// if the user should see a 'Close' button, useful when viewing a feed in column layout
	export let closeable = false;
	let commentViews = initialCommentViews;
	let commentExpandLoadingIds = new Set<number>();
	let newCommentForm: HTMLFormElement;
	$: viewingSingleCommentThread = rootCommentId !== null;
	$: rootComment = viewingSingleCommentThread ? commentViews.find((cv) => cv.comment.id === rootCommentId) : null;
	$: commentContextId = rootComment ? getCommentContextId(rootComment) : null;

	const { loggedIn } = getAppContext();
	const { sidebarVisible, nsfwImageHandling } = getSettingsContext();
	const { client, jwt } = getLemmyClient();

	let commentsPageNum = 1,
		selectedSort = 'Hot',
		newCommentText = '',
		searchText = '',
		loadingComments = false,
		// assume if they came here following a comment link, commenting on the post is less important
		showCommentComposer = rootCommentId === null,
		showPost = rootCommentId === null && (!postView.post.nsfw || $nsfwImageHandling === 'SHOW'),
		commentLoadFailed = false,
		endOfCommentsFeed = false;

	$: newCommentState = createStatefulForm(newCommentForm, onSubmitNewComment);

	$: postView && reloadComments();

	function reloadComments() {
		// start over if sorting changes
		commentsPageNum = 1;
		endOfCommentsFeed = false;
		commentViews = [];
		loadNextCommentPage();
	}

	const onSubmitNewComment: ActionFn = async (body) => {
		if (!jwt) {
			return;
		}
		const res = await client.createComment({
			content: body.content as string,
			auth: jwt,
			post_id: postView.post.id,
			language_id: body.languageId ? Number(body.languageId) : undefined
		});
		// put the new comment the user posted at the top so they can see it
		commentViews.unshift(res.comment_view);
		commentViews = commentViews;
		showCommentComposer = false;
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

	async function loadComments(
		queryFn: () => Promise<CommentView[]>
	): Promise<{ comments: number; busy: boolean; error: boolean }> {
		if (loadingComments) {
			return { comments: 0, busy: true, error: false };
		}

		loadingComments = true;

		try {
			const newCvs = await queryFn();

			return {
				comments: mergeNewCommentViews(newCvs),
				busy: false,
				error: false
			};
		} catch (e) {
			// todo show an error message
			return {
				comments: 0,
				busy: false,
				error: true
			};
		} finally {
			loadingComments = false;
		}
	}

	async function loadNextCommentPage() {
		// when viewing a single comment thread, we don't want to load more comments
		if (viewingSingleCommentThread || loadingComments || endOfCommentsFeed) {
			return;
		}

		const { comments, busy, error } = await loadComments(async () => {
			const { comments } = await client.getComments({
				auth: jwt,
				post_id: postView.post.id,
				limit: 100,
				page: commentsPageNum++,
				max_depth: 3,
				sort: selectedSort as CommentSortType,
				type_: 'All'
			});
			return comments;
		});
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
		await loadComments(async () => {
			const { comments } = await client.getComments({
				auth: jwt,
				post_id: postView.post.id,
				limit: 100,
				parent_id: e.detail,
				max_depth: 3,
				sort: selectedSort as CommentSortType,
				type_: 'All'
			});
			return comments;
		});

		commentExpandLoadingIds.delete(e.detail);
		commentExpandLoadingIds = commentExpandLoadingIds;
	}

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
