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
	}
	.post-page-root {
		position: relative;
		flex: 1;
	}
	.centered .post {
		margin: 0 auto;
		width: 80rem;
		max-width: 100%;
	}
</style>

<div
	class:sidebar-hidden={!$sidebarVisible}
	class:sidebar-visible={$sidebarVisible}
	class="f-row post-page-root"
	class:centered
>
	<div class="page-column page-column-post virtual-feed-scroll-container f-1">
		<section class="f-column p-4 f-1 post">
			{#if closeable}
				<button on:click={() => dispatch('close')} class="tertiary m-4"><Icon icon="times" /> Close Post</button>
			{/if}
			<div class="ml-6 mb-1">
				<Breadcrumbs {links} linkifyLast />
			</div>
			<Post {postView} mode="show" expandPostContent={showPost} supportsOverlay={false} {viewSource}>
				<Stack dir="r" slot="beforeEmbed" let:hasEmbeddableContent let:hasBody>
					<a href="#comments" class="button tertiary"
						><Icon icon="chevron-down" /> To Comments ({postView.counts.comments})</a
					>
					{#if hasEmbeddableContent}
						<button class="tertiary" on:click={() => (showPost = !showPost)}
							><Icon icon="newspaper" /> {showPost ? 'Hide' : 'Show'} Content</button
						>
					{/if}
					{#if hasBody}
						<button class="tertiary" on:click={() => (viewSource = !viewSource)}>
							<Icon icon="code" />
							{viewSource ? 'Hide' : 'View'} Source
						</button>
					{/if}
				</Stack>
			</Post>

			<hr class="w-100" id="comments" />

			{#if loggedIn}
				<div class="comment-editor m-2">
					<Accordion bind:open={$showNewCommentComposer} buttonClasses="tertiary">
						<span slot="title">Leave a comment</span>
						{#key $showNewCommentComposer}
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
						<Search bind:value={searchText} placeholder="Search Comments" />
					</Stack>
					<button class="tertiary" on:click={reloadComments}><Icon icon="refresh" /> Refresh Comments</button>
				</Stack>
			</section>

			{#if viewingSingleCommentThread}
				<Stack dir="r" gap={2} align="center" cl="p-4">
					<a href="/post/{postView.post.id}" class="button secondary"
						><Icon icon="arrow-up-from-bracket" />
						View all comments
					</a>
					{#if rootComment && rootComment.type === 'comment' && commentContextId !== rootComment.view.comment.id}
						<a href="/comment/{commentContextId}" class="button secondary">
							Parent comment
							<Icon icon="turn-up" />
						</a>
					{/if}
				</Stack>
			{/if}
			<ContentViewProvider store={commentCVStore}>
				<CommentTree
					{rootCommentId}
					{commentViews}
					{searchText}
					postOP={postView.creator.actor_id}
					on:expand={expandComment}
					on:new-comment={onNewComment}
					on:more={loadNextCommentPage}
					endOfFeed={endOfCommentsFeed || viewingSingleCommentThread}
					loadingContent={loadingComments}
					loadingContentFailed={commentLoadFailed}
					feedEndMessage="No more comments"
					feedEndIcon="comment-slash"
					expandLoadingIds={Array.from(commentExpandLoadingIds)}
					bind:virtualFeedAPI
					bind:renderedComments
					bind:viewportTopIndex
				/>
			</ContentViewProvider>
			<PostNavigationBar
				on:scroll-next={onScrollNext}
				on:scroll-previous={onScrollPrevious}
				{closeable}
				on:close
				{canScrollNext}
				{canScrollPrev}
			/>
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
	import CommentTree from '$lib/comments/CommentTree.svelte';
	import CommunitySidebar from './CommunitySidebar.svelte';
	import type { CommentSortType, CommentView, PostView } from 'lemmy-js-client';
	import PostNavigationBar from './PostNavigationBar.svelte';
	import { CommentSortOptions } from './feed-filters';
	import ToggleGroup from './ToggleGroup.svelte';
	import CommentEditor from './comments/CommentEditor.svelte';
	import { getAppContext } from './app-context';
	import { getCommentContextId, nameAtInstance } from './nav-utils';
	import { getLemmyClient } from './lemmy-client';
	import { createStatefulForm, type ActionFn, localStorageBackedStore } from './utils';
	import { getSettingsContext } from './settings-context';
	import { createEventDispatcher } from 'svelte';
	import { commentViewToContentView, createContentViewStore } from './content-views';
	import ContentViewProvider from './ContentViewProvider.svelte';
	import type { VirtualFeedAPI } from './virtual-feed';
	import type { CommentBranch } from './comments/comment-utils';

	const dispatch = createEventDispatcher<{ close: void }>();

	export let postView: PostView;
	export let initialCommentViews: CommentView[] = [];
	export let rootCommentId: null | number = null;
	export let centered = false;
	// if the user should see a 'Close' button, useful when viewing a feed in column layout
	export let closeable = false;

	const showNewCommentComposer = localStorageBackedStore('show-new-comment-composer', true);

	const commentCVStore = createContentViewStore();
	if (initialCommentViews) {
		commentCVStore.set(initialCommentViews.map(commentViewToContentView));
	}
	$: commentViews = $commentCVStore.map((cv) => cv.view as CommentView);

	let commentExpandLoadingIds = new Set<number>();
	let newCommentForm: HTMLFormElement;
	let viewSource = false;
	$: viewingSingleCommentThread = rootCommentId !== null;
	$: rootComment = viewingSingleCommentThread
		? $commentCVStore.find((cv) => cv.type === 'comment' && cv.view.comment.id === rootCommentId)
		: null;
	$: commentContextId = rootComment && rootComment.type === 'comment' ? getCommentContextId(rootComment.view) : null;

	const { loggedIn } = getAppContext();
	const { sidebarVisible, nsfwImageHandling } = getSettingsContext();
	const { client, jwt } = getLemmyClient();
	// this bubbles up from the virtual feed
	let virtualFeedAPI: VirtualFeedAPI;
	let renderedComments: CommentBranch[];
	let viewportTopIndex: number;

	function hasOncomingTopLevelComment(startIndex: number, length = 0, inc: number) {
		for (let i = startIndex + inc; i >= 0 && i < length; i += inc) {
			if (renderedComments?.[i].depth === 0) {
				return true;
			}
		}
		return false;
	}

	$: canScrollPrev = hasOncomingTopLevelComment(viewportTopIndex, renderedComments?.length, -1);
	// TODO this isn't quite right, if the last comment is visible on the page but not at the top of the
	// virtual feed it'll think there's still a comment you can 'next' to
	$: canScrollNext = hasOncomingTopLevelComment(viewportTopIndex, renderedComments?.length, 1);

	let commentsPageNum = 1,
		selectedSort = 'Hot',
		newCommentText = '',
		searchText = '',
		loadingComments = false,
		// assume if they came here following a comment link, commenting on the post is less important
		showPost = rootCommentId === null && (!postView.post.nsfw || $nsfwImageHandling === 'SHOW'),
		commentLoadFailed = false,
		endOfCommentsFeed = false;

	$: newCommentState = createStatefulForm(newCommentForm, onSubmitNewComment);

	$: postView && reloadComments();

	function reloadComments() {
		// if we got here by loading comments with a load function (viewing a commend individually)
		// then we shouldn't try resetting or we'll clear the comments out
		if (initialCommentViews.length) {
			return;
		}
		// start over if sorting changes
		commentsPageNum = 1;
		loadedCommentIds.clear();
		commentCVStore.clear();
		endOfCommentsFeed = false;
		loadNextCommentPage();
	}

	function onScrollPrevious() {
		let previousIndex = -1;

		for (let i = viewportTopIndex - 1; i >= 0; i--) {
			if (renderedComments[i].depth === 0) {
				previousIndex = i;
				break;
			}
		}

		if (previousIndex >= 0) {
			virtualFeedAPI.scrollToIndex(previousIndex);
		}
	}

	function onScrollNext() {
		const nextIndex = renderedComments.findIndex((cb, i) => {
			return cb.depth === 0 && i > viewportTopIndex;
		});

		if (nextIndex >= 0) {
			virtualFeedAPI.scrollToIndex(nextIndex);
		}
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
		// prevent loading from adding a duplicate of this comment
		loadedCommentIds.add(res.comment_view.comment.id);
		// put the new comment the user posted at the top so they can see it
		commentCVStore.prepend([commentViewToContentView(res.comment_view)]);
		newCommentText = '';
	};

	function onNewComment(e: CustomEvent<CommentView>) {
		commentCVStore.append([commentViewToContentView(e.detail)]);
	}

	const loadedCommentIds = new Set<number>();

	async function loadComments(
		queryFn: () => Promise<CommentView[]>
	): Promise<{ comments: number; busy: boolean; error: boolean }> {
		if (loadingComments) {
			return { comments: 0, busy: true, error: false };
		}

		loadingComments = true;

		try {
			const newCvs = await queryFn();

			const newComments = newCvs.filter((cv) => !loadedCommentIds.has(cv.comment.id));

			for (const cv of newComments) {
				loadedCommentIds.add(cv.comment.id);
			}

			commentCVStore.append(newComments.map(commentViewToContentView));

			return {
				comments: newComments.length,
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
		if (!commentLoadFailed && (viewingSingleCommentThread || loadingComments || endOfCommentsFeed)) {
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
