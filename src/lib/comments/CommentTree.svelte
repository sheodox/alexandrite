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
	.search-match {
		background: var(--sx-yellow-transparent-faint);
	}
</style>

<Stack gap={0}>
	<VirtualFeed
		feedSize={commentTree.length}
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
			{@const { cv, depth, parentComment } = commentTree[index]}
			{@const collapsed = collapsedComments.some((c) => cv.comment.id === c)}
			{@const shallowerThanLast = depth < (commentTree[index - 1]?.depth ?? 0)}
			{@const isSearchMatch = searchText !== '' && searchMatchIds.includes(cv.comment.id)}
			{#key cv.comment.id}
				<div class="comment">
					<div
						class="comment-leaf p-2 pb-0"
						class:collapsed
						class:nested={depth > 0}
						class:last-of-depth={depth > 0 && depth !== commentTree[index + 1]?.depth}
						class:search-match={isSearchMatch}
						style:margin-left="calc(var(--sx-spacing-{$screenDimensions.width < 800 ? 3 : 6}) * {depth})"
					>
						<Comment
							contentView={commentViewToContentView(cv)}
							{postOP}
							on:collapse
							{collapsed}
							on:new-comment
							{isSearchMatch}
							{searchText}
							parentComment={shallowerThanLast ? parentComment : undefined}
							{postLocked}
							bind:api={commentAPIs[index]}
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
	import { createEventDispatcher } from 'svelte';
	import Spinner from '../Spinner.svelte';
	import { commentViewToContentView } from '../content-views';
	import type { VirtualFeedAPI } from '../virtual-feed';
	import type { CommentAPI, CommentBranch } from './comment-utils';
	import { getAppContext } from '$lib/app-context';

	export let postOP: string;
	// the comment search query text
	export let searchText: string;
	// IDs of all matching comments
	export let searchMatchIds: number[];
	export let commentTree: CommentBranch[];
	export let loadingContent: boolean;
	export let loadingContentFailed: boolean;
	export let collapsedComments: number[];
	export let feedEndMessage: string;
	export let feedEndIcon: string;
	export let endOfFeed: boolean;
	export let expandLoadingIds: number[];
	export let virtualFeedAPI: VirtualFeedAPI;
	export let viewportTopIndex: number;
	export let postLocked: boolean;
	export let commentAPIs: CommentAPI[] = [];

	const { screenDimensions } = getAppContext();

	const dispatch = createEventDispatcher<{
		expand: number;
		more: void;
	}>();

	function loadedChildren(id: number) {
		let total = 0;
		for (let i = 0; i < commentTree.length; i++) {
			const commentPath = commentTree[i].cv.comment.path;
			if (commentPath.includes(id + '') && !commentPath.endsWith('.' + id)) {
				total++;
			}
		}
		return total;
	}
</script>
