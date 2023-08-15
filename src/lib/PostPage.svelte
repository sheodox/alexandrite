<style lang="scss">
	$sidebarWidth: 30rem;
	hr {
		border-color: var(--sx-gray-transparent-lighter);
	}
	.page-column-sidebar {
		background-color: var(--sx-gray-800);
		width: 30rem;
		padding: 1rem;
		border-left: 2px solid var(--sx-gray-transparent-light);
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

<!-- keydown is just an extra convenience, not the only way to close the post -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class:sidebar-hidden={!$sidebarVisible}
	class:sidebar-visible={$sidebarVisible}
	class="f-row post-page-root"
	class:centered
	on:keydown={onPostPageKeydown}
>
	<!-- need tabindex to allow focusing with keyboard to scroll  -->
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<div class="page-column page-column-post virtual-feed-scroll-container f-1" tabindex={0} use:focus>
		<section class="f-column p-2 f-1 post">
			{#if closeable}
				<button on:click={dispatchClose} class="tertiary m-2"><Icon icon="times" /> Close Post</button>
			{/if}
			<div class="ml-4 mb-1">
				<Breadcrumbs {links} linkifyLast />
			</div>
			<PostLayout
				{postView}
				bind:expandPostContent={showPost}
				supportsOverlay={false}
				forceLayout="LIST"
				bind:api={postLayoutApi}
				mode="show"
			>
				<Stack dir="r" slot="before-embed" cl="p-1 pb-3">
					{@const small = $screenDimensions.width < 800 ? 'small' : ''}
					<a href="#comments" class="button tertiary {small}"
						><Icon icon="chevron-down" /> To Comments ({postView.counts.comments})</a
					>
					{#if postAssertions.has.any}
						<button class="tertiary {small}" on:click={() => (showPost = !showPost)}>
							<Icon icon={showPost ? 'eye-slash' : 'newspaper'} />
							{showPost ? 'Hide' : 'Show'} Content
						</button>
					{/if}
				</Stack>
			</PostLayout>
			<hr class="w-100" id="comments" />

			{#if $profile.loggedIn && !postView.post.locked}
				<div class="comment-editor p-2">
					<Accordion bind:open={$showNewCommentComposer} buttonClasses="tertiary">
						<span slot="title">Leave a comment</span>
						{#key $showNewCommentComposer}
							<form bind:this={newCommentForm} use:submitOnHardEnter>
								<CommentEditor
									submitting={$newCommentState.busy}
									bind:value={newCommentText}
									community={postView.community}
								/>
							</form>
						{/key}
					</Accordion>
				</div>
			{/if}

			<h2 class="px-2 mt-6 mb-0">Comments ({postView.counts.comments})</h2>
			<section class="comment-sort-bar">
				<Stack gap={4} dir="r" justify="between" align="center">
					<Stack gap={4} align="center" cl="p-2" dir="r">
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
				<Stack dir="r" gap={2} align="center" cl="p-2">
					<a href="/{$profile.instance}/post/{postView.post.id}" class="button secondary"
						><Icon icon="arrow-up-from-bracket" />
						View all comments
					</a>
					{#if rootComment && rootComment.type === 'comment' && commentContextId !== rootComment.view.comment.id}
						<a href="/{$profile.instance}/comment/{commentContextId}" class="button secondary">
							Parent comment
							<Icon icon="turn-up" />
						</a>
					{/if}
				</Stack>
			{/if}
			<ContentViewProvider store={commentCVStore}>
				<CommentTree
					{searchText}
					{commentTree}
					{collapsedComments}
					postOP={postView.creator.actor_id}
					on:expand={expandComment}
					on:new-comment={onNewComment}
					on:more={loadNextCommentPage}
					on:collapse={(e) => toggleCollapse(e.detail)}
					endOfFeed={endOfCommentsFeed || viewingSingleCommentThread}
					loadingContent={loadingComments}
					loadingContentFailed={commentLoadFailed}
					feedEndMessage="No more comments"
					feedEndIcon="comment-slash"
					expandLoadingIds={Array.from(commentExpandLoadingIds)}
					bind:virtualFeedAPI
					bind:viewportTopIndex={commentViewportTopIndex}
					searchMatchIds={commentSearchMatchIds}
					postLocked={postView.post.locked}
					bind:commentAPIs
				/>
			</ContentViewProvider>
			<PostNavigationBar
				on:scroll-next={onScrollNextTopLevel}
				on:scroll-previous={onScrollPreviousTopLevel}
				on:scroll-next-result={() => onCommentSearchIndexChange(1)}
				on:scroll-previous-result={() => onCommentSearchIndexChange(-1)}
				on:clear-search={() => (searchText = '')}
				{closeable}
				on:close
				{canScrollNext}
				{canScrollPrev}
				{canScrollNextResult}
				{canScrollPrevResult}
				isSearching={searchText !== ''}
				searchResultCount={commentSearchMatchIds.length}
				searchResultIndex={commentSearchResultIndex}
			/>
		</section>
	</div>
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<div class="page-column page-column-sidebar virtual-feed-scroll-container" tabindex="0">
		<aside>
			<CommunitySidebar community={postView.community} />
		</aside>
	</div>
</div>

<script lang="ts">
	import { Search, Stack, Icon, Breadcrumbs, Accordion, focus } from 'sheodox-ui';
	import PostLayout from './feeds/posts/PostLayout.svelte';
	import CommentTree from '$lib/comments/CommentTree.svelte';
	import CommunitySidebar from './CommunitySidebar.svelte';
	import type { CommentSortType, CommentView, PostView } from 'lemmy-js-client';
	import PostNavigationBar from './PostNavigationBar.svelte';
	import { CommentSortOptions } from './feed-filters';
	import ToggleGroup from './ToggleGroup.svelte';
	import CommentEditor from './comments/CommentEditor.svelte';
	import { getCommentContextId, nameAtInstance } from './nav-utils';
	import {
		createStatefulForm,
		type ActionFn,
		localStorageBackedStore,
		isElementEditable,
		submitOnHardEnter
	} from './utils';
	import { getSettingsContext } from './settings-context';
	import { createEventDispatcher, onMount } from 'svelte';
	import {
		commentViewToContentView,
		createContentViewStore,
		getContentViewStore,
		postViewToContentView
	} from './content-views';
	import ContentViewProvider from './ContentViewProvider.svelte';
	import { profile, instance } from './profiles/profiles';
	import type { VirtualFeedAPI } from './virtual-feed';
	import type { CommentAPI, CommentBranch } from './comments/comment-utils';
	import { getCommunityContext } from './community-context/community-context';
	import { makePostAssertions, type PostLayoutAPI } from './feeds/posts/post-utils';
	import { getAppContext } from './app-context';

	const dispatch = createEventDispatcher<{ close: void }>();

	export let postView: PostView;
	export let initialCommentViews: CommentView[] = [];
	export let rootCommentId: null | number = null;
	export let centered = false;
	// if the user should see a 'Close' button, useful when viewing a feed in column layout
	export let closeable = false;

	const showNewCommentComposer = localStorageBackedStore('show-new-comment-composer', true);
	const { sidebarVisible, nsfwImageHandling } = getSettingsContext();
	const { screenDimensions } = getAppContext();

	let commentAPIs: CommentAPI[] | undefined;
	let postLayoutApi: PostLayoutAPI | undefined;

	const communityContext = getCommunityContext();
	$: communityName = nameAtInstance(postView.community);
	$: communityContext.getCommunity(communityName);

	$: client = $profile.client;
	$: jwt = $profile.jwt;

	$: postAssertions = makePostAssertions(postView);

	const postCVStore = getContentViewStore();

	const commentCVStore = createContentViewStore();
	if (initialCommentViews) {
		commentCVStore.set(initialCommentViews.map(commentViewToContentView));
	}
	$: commentViews = $commentCVStore.map((cv) => cv.view as CommentView);

	let commentExpandLoadingIds = new Set<number>();
	let newCommentForm: HTMLFormElement;
	let commentsPageNum = 1,
		selectedSort = 'Hot',
		newCommentText = '',
		searchText = '',
		loadingComments = false,
		// assume if they came here following a comment link, commenting on the post is less important
		showPost = rootCommentId === null && (!postView.post.nsfw || $nsfwImageHandling === 'SHOW'),
		commentLoadFailed = false,
		endOfCommentsFeed = false,
		virtualFeedAPI: VirtualFeedAPI,
		// the index of the comment at the top of the viewport, used for navigating between comments
		commentViewportTopIndex: number;

	$: viewingSingleCommentThread = rootCommentId !== null;
	$: rootComment = viewingSingleCommentThread
		? $commentCVStore.find((cv) => cv.type === 'comment' && cv.view.comment.id === rootCommentId)
		: null;
	$: commentContextId = rootComment && rootComment.type === 'comment' ? getCommentContextId(rootComment.view) : null;

	const dispatchClose = () => dispatch('close');

	// export so the parent can index them in sorted order with post navigation buttons
	export let commentTree: CommentBranch[] = [];
	let commentSearchMatchIds: number[] = [];
	$: searchComments(commentTree, searchText);
	// the current index in commentSearchMatchIds  we're scrolling through when hitting next/prev search result
	let commentSearchResultIndex = -1;
	// needs to stay within bounds, but also always show it if there's only one comment, else they can't
	// scroll to the comment after the first time
	$: canScrollNextResult =
		commentSearchResultIndex < commentSearchMatchIds.length - 1 || commentSearchMatchIds.length === 1;
	$: canScrollPrevResult = commentSearchResultIndex > 0;

	function onCommentSearchIndexChange(inc: number) {
		commentSearchResultIndex = Math.max(0, Math.min(commentSearchMatchIds.length - 1, commentSearchResultIndex + inc));
		const index = commentTree.findIndex((x) => {
			return x.cv.comment.id === commentSearchMatchIds[commentSearchResultIndex];
		});

		if (index !== -1) {
			virtualFeedAPI.scrollToIndex(index);
		}
	}

	function searchComments(commentTree: CommentBranch[], searchText: string) {
		if (!searchText) {
			commentTree = commentTree;
			commentSearchMatchIds = [];
			return;
		}
		searchText = searchText.toLowerCase();
		commentSearchResultIndex = -1;

		commentSearchMatchIds = commentTree
			.filter((cb) => {
				const { comment } = cb.cv;
				// deleted comments should not expose their contents
				if (comment.deleted || comment.removed) {
					return false;
				}
				return cb.cv.comment.content.toLowerCase().includes(searchText);
			})
			.map((cb) => cb.cv.comment.id);
	}

	function getRootPath(rootId: number | null) {
		if (rootCommentId === null) {
			return '0';
		}

		const rootCV = commentViews.find((cv) => cv.comment.id === rootId);

		if (rootCV) {
			const rootPath = rootCV.comment.path.split('.');
			rootPath.pop();
			return rootPath.join('.');
		}

		return '0';
	}

	let collapsedCommentSet = new Set<number>(),
		collapsedComments: number[] = [];

	function toggleCollapse(commentId: number) {
		collapsedCommentSet.has(commentId) ? collapsedCommentSet.delete(commentId) : collapsedCommentSet.add(commentId);
		collapsedComments = Array.from(collapsedCommentSet);
	}

	$: rootPath = getRootPath(rootCommentId);
	$: commentTree = buildCommentTree(rootPath, commentViews, 0, Array.from(collapsedComments));

	function buildCommentTree(
		path: string,
		commentViews: CommentView[] = [],
		depth: number,
		collapsed: number[],
		parentComment?: CommentView
	): CommentBranch[] {
		return (
			commentViews
				// filter out anything that's not at this level in the tree...
				// (anything that's a child of `path` has a path itself like `<path>.<comment.id>`)
				.filter((cv) => {
					return cv.comment.path === path + '.' + cv.comment.id && !collapsed.some((c) => path.includes('' + c));
				})
				// ...so we can show all of the child comments as the siblings of this parent comment so they show next to each other
				.map((cv) => {
					return [
						{ cv, depth, path, parentComment },
						...buildCommentTree(path + '.' + cv.comment.id, commentViews, depth + 1, collapsed, cv)
					];
				})
				.flat()
		);
	}

	function hasOncomingTopLevelComment(startIndex: number, length = 0, inc: number) {
		for (let i = startIndex + inc; i >= 0 && i < length; i += inc) {
			if (commentTree?.[i].depth === 0) {
				return true;
			}
		}
		return false;
	}

	$: canScrollPrev = hasOncomingTopLevelComment(commentViewportTopIndex, commentTree?.length, -1);
	// TODO this isn't quite right, if the last comment is visible on the page but not at the top of the
	// virtual feed it'll think there's still a comment you can 'next' to
	$: canScrollNext = hasOncomingTopLevelComment(commentViewportTopIndex, commentTree?.length, 1);

	$: newCommentState = createStatefulForm(newCommentForm, onSubmitNewComment);

	let postIdOfLoadedComments: number | undefined;
	$: {
		// the postView can update when voting on the post in a feed, or more pages of comments load.
		// only invalidate old comments if the post ID is different
		if (postView.post.id !== postIdOfLoadedComments) {
			postIdOfLoadedComments = postView.post.id;
			reloadComments();
		}
	}

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
		virtualFeedAPI.scrollToIndex(commentViewportTopIndex - 1);
	}

	function onScrollNext() {
		virtualFeedAPI.scrollToIndex(commentViewportTopIndex + 1);
	}

	function onScrollPreviousTopLevel() {
		let previousIndex = -1;

		for (let i = commentViewportTopIndex - 1; i >= 0; i--) {
			if (commentTree[i].depth === 0) {
				previousIndex = i;
				break;
			}
		}

		if (previousIndex >= 0) {
			virtualFeedAPI.scrollToIndex(previousIndex);
		}
	}

	function onScrollNextTopLevel() {
		const nextIndex = commentTree.findIndex((cb, i) => {
			return cb.depth === 0 && i > commentViewportTopIndex;
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

	$: links = [
		{
			text: 'Home',
			href: `/${$instance}`
		},
		{
			text: communityName,
			href: `/${$instance}/c/${communityName}/`
		}
	];

	onMount(async () => {
		if (jwt) {
			// getting the post has a side effect of marking it and its comments as read
			const pv = await client.getPost({ id: postView.post.id, auth: jwt }).then(({ post_view }) => {
				post_view.read = true;
				post_view.unread_comments = 0;
				return post_view;
			});
			postCVStore.updateView(postViewToContentView(pv));
		}
	});

	function onPostPageKeydown(e: KeyboardEvent) {
		// don't handle keys if in an editable element
		if (isElementEditable(e.target as HTMLElement)) {
			return;
		}

		const key = e.key.toLowerCase(),
			topCommentApi = commentAPIs && commentAPIs[commentViewportTopIndex];

		// escape closes the post
		if (key === 'escape') {
			// TODO make this also check for pending replies
			if (!newCommentText || confirm('You have an unsubmitted comment, are you sure you want to close the post?')) {
				dispatchClose();
			}
		}
		// j and k go to the next/prev comment, but
		// if shift is held it'll do the next/prev top level comment or
		// search result if searching
		else if (key === 'j') {
			if (e.shiftKey) {
				searchText ? onCommentSearchIndexChange(1) : onScrollNextTopLevel();
			} else {
				onScrollNext();
			}
		} else if (key === 'k') {
			if (e.shiftKey) {
				searchText ? onCommentSearchIndexChange(-1) : onScrollPreviousTopLevel();
			} else {
				onScrollPrevious();
			}
		} else if (key === 'a') {
			e.shiftKey ? postLayoutApi?.upvote() : topCommentApi?.upvote();
		} else if (key === 'z') {
			e.shiftKey ? postLayoutApi?.downvote() : topCommentApi?.downvote();
		} else if (key === 's') {
			e.shiftKey ? postLayoutApi?.save() : topCommentApi?.save();
		}
	}
</script>
