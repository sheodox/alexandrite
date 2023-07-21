<style lang="scss">
	.nested {
		border-left: 2px solid var(--sx-gray-300);
		border-bottom: 2px solid var(--sx-gray-300);
	}
	.comment-leaf:not(.nested) {
		border-bottom: 2px solid var(--sx-gray-300);
	}
	.comment:last-of-type {
		padding-bottom: var(--sx-spa);
	}
	.comment-leaf:hover {
		background: var(--sx-gray-transparent);
	}
	.collapsed {
		max-height: 4rem;
		overflow: hidden;
		opacity: 0.5;
	}
	.last-of-depth {
		border-radius: 0 0 0 6px;
	}
</style>

<Stack gap={0} cl="px-4">
	<VirtualFeed
		feedSize={renderedComments.length}
		on:more
		{endOfFeed}
		{feedEndIcon}
		{feedEndMessage}
		loading={loadingContent}
		loadMoreFailed={loadingContentFailed}
		bind:api={virtualFeedAPI}
		bind:viewportTopIndex
	>
		<svelte:fragment let:index>
			{@const { cv, depth, parentComment } = renderedComments[index]}
			{@const collapsed = collapsedComments.some((c) => cv.comment.id === c)}
			{@const shallowerThanLast = depth < (renderedComments[index - 1]?.depth ?? 0)}
			{#key cv.comment.id}
				<div class="comment">
					<div
						class="comment-leaf p-2 pb-0"
						class:collapsed
						class:nested={depth > 0}
						class:last-of-depth={depth > 0 && depth !== renderedComments[index + 1]?.depth}
						style:margin-left="calc(var(--sx-spacing-6) * {depth})"
					>
						<Comment
							contentView={commentViewToContentView(cv)}
							{postOP}
							on:collapse={() => toggleCollapse(cv.comment.id)}
							{collapsed}
							on:new-comment
							searchNonMatch={searchText !== '' && !commentSearchMatchIds.includes(cv.comment.id)}
							parentComment={shallowerThanLast ? parentComment : undefined}
						/>
						{#if cv.counts.child_count > 0 && !collapsed && loadedChildren(cv.comment.id) === 0}
							{@const loading = expandLoadingIds.includes(cv.comment.id)}
							<div>
								<button
									class="tertiary f-row gap-2"
									on:click={() => dispatch('expand', cv.comment.id)}
									disabled={loading}
								>
									{#if loading}
										<Spinner />
									{/if}
									Load {cv.counts.child_count}
									{cv.counts.child_count === 1 ? 'reply' : 'replies'}</button
								>
							</div>
						{/if}
					</div>
				</div>
			{/key}
		</svelte:fragment>
	</VirtualFeed>
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Comment from './Comment.svelte';
	import VirtualFeed from '../VirtualFeed.svelte';
	import type { CommentView } from 'lemmy-js-client';
	import { createEventDispatcher } from 'svelte';
	import Spinner from '../Spinner.svelte';
	import { commentViewToContentView } from '../content-views';
	import type { VirtualFeedAPI } from '../virtual-feed';
	import type { CommentBranch } from './comment-utils';

	export let postOP: string;
	export let searchText: string;
	export let commentViews: CommentView[];
	export let path = '0';
	export let rootCommentId: number | null = null;
	export let loadingContent: boolean;
	export let loadingContentFailed: boolean;
	export let feedEndMessage: string;
	export let feedEndIcon: string;
	export let endOfFeed: boolean;
	export let expandLoadingIds: number[];
	export let virtualFeedAPI: VirtualFeedAPI;
	export let viewportTopIndex: number;

	let collapsedCommentSet = new Set<number>(),
		collapsedComments: number[] = [];

	$: rootPath = getRootPath(rootCommentId, path);

	function toggleCollapse(commentId: number) {
		collapsedCommentSet.has(commentId) ? collapsedCommentSet.delete(commentId) : collapsedCommentSet.add(commentId);
		collapsedComments = Array.from(collapsedCommentSet);
	}

	const dispatch = createEventDispatcher<{
		expand: number;
		more: void;
	}>();

	function getRootPath(rootId: number | null, path: string) {
		if (rootCommentId === null) {
			return path;
		}

		const rootCV = commentViews.find((cv) => cv.comment.id === rootId);

		if (rootCV) {
			const rootPath = rootCV.comment.path.split('.');
			rootPath.pop();
			return rootPath.join('.');
		}

		return '0';
	}

	function loadedChildren(id: number) {
		let total = 0;
		for (let i = 0; i < commentViews.length; i++) {
			const commentPath = commentViews[i].comment.path;
			if (commentPath.includes(id + '') && !commentPath.endsWith('.' + id)) {
				total++;
			}
		}
		return total;
	}

	function getBranches(
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
						...getBranches(path + '.' + cv.comment.id, commentViews, depth + 1, collapsed, cv)
					];
				})
				.flat()
		);
	}

	function filterComments(commentTree: CommentBranch[], searchText: string) {
		if (!searchText) {
			renderedComments = commentTree;
			commentSearchMatchIds = [];
			return;
		}
		searchText = searchText.toLowerCase();

		const commentSearchMatches = commentTree.filter((cb) => cb.cv.comment.content.toLowerCase().includes(searchText));

		commentSearchMatchIds = commentSearchMatches.map((cb) => cb.cv.comment.id);

		const matchPaths = commentSearchMatches.map((cb) => cb.cv.comment.path);

		renderedComments = commentTree.filter((cb) => {
			return matchPaths.some((p) => p.includes('' + cb.cv.comment.id));
		});
	}

	$: commentTree = getBranches(rootPath, commentViews, 0, Array.from(collapsedComments));

	// export so the parent can index them in sorted order with post navigation buttons
	export let renderedComments: CommentBranch[] = [];
	let commentSearchMatchIds: number[] = [];
	$: filterComments(commentTree, searchText);
</script>
