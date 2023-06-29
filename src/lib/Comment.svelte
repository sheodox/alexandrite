<style>
	.comment-content :global(:first-child) {
		margin-top: 0;
	}
	.comment-content :global(:not(:last-child)) {
		margin-top: 0;
		margin-bottom: 0.4rem;
	}
	.comment-content :global(:last-child) {
		margin-bottom: 0;
	}
	.comment-content,
	.reply-editor {
		max-width: 60rem;
	}
	section :global(img) {
		max-width: 100%;
	}
	.maybe-deleting {
		outline: 3px solid var(--sx-red-transparent);
		border-radius: 10px;
	}
	.deleted-msg {
		font-style: italic;
	}
</style>

<section class:maybe-deleting={maybeDeleting}>
	<Stack gap={2} dir="c">
		<Stack gap={1} dir="r" align="center">
			{#if !showPost}
				<Tooltip>
					<span slot="tooltip">{collapseMsg}</span>
					<button on:click={() => dispatch('collapse')} class="tertiary small m-0 mr-1">
						<Icon icon={collapsed ? 'chevron-right' : 'chevron-down'} variant="icon-only" />
						<span class="sr-only">{collapseMsg}</span>
					</button>
				</Tooltip>
			{/if}
			<UserLink user={commentView.creator} />
			<UserBadges user={commentView.creator} {postOP} />
			{#if showPost}
				to <CommunityLink community={commentView.community} />
				<span class="muted"> &centerdot; </span>
				<a href="/post/{commentView.post.id}" class="inline-link" title={commentView.post.name}>
					<EllipsisText>{commentView.post.name}</EllipsisText>
				</a>
			{/if}
			<span class="muted"> &centerdot; </span>
			<a href="/comment/{commentView.comment.id}">
				<RelativeTime date={commentView.comment.published} />
			</a>
			{#if commentView.comment.updated && commentView.comment.updated !== commentView.comment.published}
				<RelativeTime date={commentView.comment.updated} variant="icon" icon="edit" verb="Edited" />
			{/if}
		</Stack>
		{#if !collapsed}
			<div class="comment-content">
				{#if commentView.comment.deleted}
					<p class="muted deleted-msg">Deleted by creator</p>
				{:else}
					<Markdown md={commentView.comment.content} />
				{/if}
			</div>
			<Stack dir="r" gap={2} align="center">
				<slot name="actions-start" />
				<VoteButtons
					vote={commentView.my_vote}
					score={commentView.counts.score}
					dir="row"
					small
					on:vote={vote}
					{votePending}
				/>
				<IconLink icon="link" text="Show in context" href="/comment/{contextCommentId}" small />
				{#if maybeDeleting}
					<button class="danger small sx-font-size-2" on:click={() => deleteComment(true)} disabled={someActionPending}
						>Delete</button
					>
					<button
						class="tertiary small sx-font-size-2"
						on:click={() => (maybeDeleting = false)}
						disabled={someActionPending}>Cancel</button
					>
				{:else}
					<LogButton on:click={() => console.log({ commentView })} />
					{#if loggedIn}
						<IconButton
							icon="reply"
							small
							text="Reply"
							on:click={() => (showReplyComposer = true)}
							disabled={someActionPending}
						/>
						{#if myComment}
							<IconButton
								icon="edit"
								small
								text="Edit"
								on:click={() => (showCommentEdit = true)}
								disabled={someActionPending}
							/>
							{#if commentView.comment.deleted}
								<IconButton
									icon="recycle"
									small
									text="Restore"
									disabled={deletePending}
									on:click={() => deleteComment(false)}
								/>
							{:else}
								<IconButton
									icon="trash-can"
									small
									text="Delete"
									on:click={() => (maybeDeleting = true)}
									disabled={someActionPending}
								/>
							{/if}
						{/if}
					{/if}
				{/if}
				{#if deletePending}
					<Spinner />
				{/if}
			</Stack>
		{/if}
		{#if showCommentEdit}
			<form
				use:enhance={commentEditSubmit}
				on:submit={() => {
					submittingEdit = true;
				}}
				action="/post/{commentView.post.id}/?/editComment"
				method="POST"
				class="reply-editor"
			>
				<input type="hidden" name="commentId" value={commentView.comment.id} />
				<CommentEditor
					value={commentView.comment.content}
					selectedLanguage={commentView.comment.language_id}
					cancellable
					label="Edit"
					on:cancel={() => (showCommentEdit = false)}
					submitting={submittingEdit}
				/>
			</form>
		{/if}
		{#if showReplyComposer && loggedIn}
			<form
				use:enhance={commentReplySubmit}
				on:submit={() => {
					submittingReply = true;
				}}
				action="/post/{commentView.post.id}/?/postComment"
				method="POST"
				class="reply-editor"
			>
				<input type="hidden" name="parentId" value={commentView.comment.id} />
				<CommentEditor cancellable on:cancel={() => (showReplyComposer = false)} submitting={submittingReply} />
			</form>
		{/if}
	</Stack>
</section>

<script lang="ts">
	import { Stack, Tooltip, Icon } from 'sheodox-ui';
	import { enhance } from '$app/forms';
	import UserLink from './UserLink.svelte';
	import Markdown from './Markdown.svelte';
	import VoteButtons from './VoteButtons.svelte';
	import RelativeTime from './RelativeTime.svelte';
	import UserBadges from './feeds/posts/UserBadges.svelte';
	import LogButton from './LogButton.svelte';
	import type { CommentView } from 'lemmy-js-client';
	import IconButton from './IconButton.svelte';
	import IconLink from './IconLink.svelte';
	import CommentEditor from './CommentEditor.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { getAppContext } from './app-context';
	import Spinner from './Spinner.svelte';
	import CommunityLink from './CommunityLink.svelte';
	import EllipsisText from '$lib/EllipsisText.svelte';
	import { getCommentContextId } from './nav-utils';

	const dispatch = createEventDispatcher<{
		collapse: void;
		'new-comment': CommentView;
		'update-comment': CommentView;
	}>();

	export let commentView: CommentView;
	export let postOP: string;
	export let collapsed = false;
	export let showPost = false;

	const { loggedIn, username } = getAppContext();

	$: myComment = commentView.creator.local && commentView.creator.name === username;

	let showReplyComposer = false;
	let showCommentEdit = false;
	let votePending = false;
	let deletePending = false;
	let submittingReply = false;
	let submittingEdit = false;
	let maybeDeleting = false;
	$: someActionPending =
		showReplyComposer || showCommentEdit || deletePending || votePending || submittingReply || submittingEdit;

	$: collapseMsg = collapsed ? 'Show comment' : 'Hide comment';
	$: contextCommentId = getCommentContextId(commentView);

	const commentReplySubmit: SubmitFunction<{ commentView: CommentView }> = () => {
		return async ({ update, result }) => {
			await update();
			submittingReply = false;

			showReplyComposer = false;

			if (result.type === 'success' && result.data) {
				dispatch('update-comment', result.data.commentView);
			}
		};
	};

	const commentEditSubmit: SubmitFunction<{ commentView: CommentView }> = () => {
		return async ({ update, result }) => {
			await update();
			submittingEdit = false;

			if (result.type === 'success' && result.data) {
				dispatch('update-comment', result.data.commentView);
				showCommentEdit = false;
			}
		};
	};

	async function vote(e: CustomEvent<number>) {
		votePending = true;
		const res = await fetch(`/api/comments/${commentView.comment.id}/vote`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				score: e.detail
			})
		});

		if (res.ok) {
			const newCV: CommentView = (await res.json()).commentView;
			commentView.counts.score = newCV.counts.score;
			commentView.my_vote = newCV.my_vote;
		}
		votePending = false;
	}

	async function deleteComment(deleted: boolean) {
		deletePending = true;
		const res = await fetch(`/api/comments/${commentView.comment.id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				deleted
			})
		});

		if (res.ok) {
			const cv = await res.json();
			dispatch('update-comment', cv.commentView as CommentView);
		}
		deletePending = false;
		maybeDeleting = false;
	}
</script>
