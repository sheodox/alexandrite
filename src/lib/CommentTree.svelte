<style>
	.nested {
		border-left: 2px solid var(--sx-gray-300);
	}
	.comment:last-of-type {
		padding-bottom: var(--sx-spa);
	}
	.comment-leaf:hover {
		background: var(--sx-gray-transparent);
		border-radius: 5px;
	}
	.collapsed {
		max-height: 4rem;
		overflow: hidden;
		opacity: 0.5;
	}
</style>

<Stack gap={nestedLevel === 0 ? 3 : 1} cl="px-4 pt-{nestedLevel === 0 ? 2 : 0}">
	{#each commentTree as { cv, children }}
		{@const collapsed = collapsedComments.includes(cv.comment.id)}
		<div class="comment">
			<div class="comment-leaf p-2 pb-0" class:collapsed>
				<Comment
					commentView={cv}
					{postOP}
					on:collapse={() => toggleCollapse(cv.comment.id)}
					{collapsed}
					on:new-comment
					on:update-comment
				/>
			</div>
			{#if !collapsed}
				{#if children.length}
					<div class="nested">
						<svelte:self
							nestedLevel={nestedLevel + 1}
							{commentViews}
							path={cv.comment.path}
							{postOP}
							on:expand
							on:new-comment
							on:update-comment
						/>
					</div>
				{:else if cv.counts.child_count > 0}
					<div class="nested">
						<p class="p-2">
							<button class="tertiary" on:click={() => dispatch('expand', cv.comment.id)}>
								Load {cv.counts.child_count} {cv.counts.child_count === 1 ? 'reply' : 'replies'}</button
							>
						</p>
					</div>
				{/if}
			{/if}
		</div>
	{/each}
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Comment from './Comment.svelte';
	import type { CommentView } from 'lemmy-js-client';
	import { createEventDispatcher } from 'svelte';

	let collapsedCommentSet = new Set<number>(),
		collapsedComments: number[] = [];

	function toggleCollapse(commentId: number) {
		collapsedCommentSet.has(commentId) ? collapsedCommentSet.delete(commentId) : collapsedCommentSet.add(commentId);
		collapsedComments = Array.from(collapsedCommentSet);
	}

	const dispatch = createEventDispatcher<{
		expand: number;
		more: void;
	}>();

	interface CommentBranch {
		cv: CommentView;
		children: CommentBranch[];
	}

	export let postOP: string;
	export let commentViews: CommentView[];
	export let path = '0';
	export let nestedLevel = 0;

	// each
	function getBranches(path: string, commentViews: CommentView[] = []): CommentBranch[] {
		return commentViews
			.filter((cv) => {
				return cv.comment.path === path + '.' + cv.comment.id;
			})
			.map((cv) => {
				return { cv, children: getBranches(path + '.' + cv.comment.id, commentViews) };
			});
	}

	$: commentTree = getBranches(path, commentViews);
</script>
