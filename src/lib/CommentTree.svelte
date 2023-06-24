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
</style>

<Stack gap={nestedLevel === 0 ? 5 : 1} cl="px-4 pt-{nestedLevel === 0 ? 2 : 0}">
	{#each commentTree as { cv, children }, index}
		<div class="pl-2 comment">
			<div class="comment-leaf pb-2 px-1">
				<Comment commentView={cv} {postOP} />
			</div>
			{#if children.length}
				<div class="nested">
					<svelte:self nestedLevel={nestedLevel + 1} {commentViews} path={cv.comment.path} {postOP} />
				</div>
			{/if}
		</div>
	{:else}
		<p>There are no coments here!</p>
	{/each}
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Comment from './Comment.svelte';
	import type { CommentView } from 'lemmy-js-client';

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
