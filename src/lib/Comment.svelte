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
	.search-non-match:not(:hover) {
		height: 2rem;
		overflow: hidden;
		opacity: 0.5;
	}
</style>

<section class:maybe-deleting={maybeDeleting} class:search-non-match={searchNonMatch}>
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
					upvotes={commentView.counts.upvotes}
					downvotes={commentView.counts.downvotes}
					dir="row"
					small
					on:vote={(e) => $voteState.submit(e.detail)}
					votePending={$voteState.busy}
				/>
				<IconLink icon="link" text="Show in context" href="/comment/{contextCommentId}" small />
				{#if maybeDeleting}
					<BusyButton
						cl="danger small sx-font-size-2"
						on:click={() => $deleteState.submit(true)}
						busy={$deleteState.busy}
					>
						Delete
					</BusyButton>
					<button
						class="tertiary small sx-font-size-2"
						on:click={() => (maybeDeleting = false)}
						disabled={$deleteState.busy}>Cancel</button
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
									busy={$deleteState.busy}
									on:click={() => $deleteState.submit(false)}
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
			<form bind:this={editForm} class="reply-editor">
				<input type="hidden" name="commentId" value={commentView.comment.id} />
				<CommentEditor
					value={commentView.comment.content}
					selectedLanguage={commentView.comment.language_id}
					cancellable
					label="Edit"
					on:cancel={() => (showCommentEdit = false)}
					submitting={$editState.busy}
				/>
			</form>
		{/if}
		{#if showReplyComposer && loggedIn}
			<form bind:this={replyForm} class="reply-editor">
				<input type="hidden" name="parentId" value={commentView.comment.id} />
				<CommentEditor cancellable on:cancel={() => (showReplyComposer = false)} submitting={$replyState.busy} />
			</form>
		{/if}
	</Stack>
</section>

<script lang="ts">
	import { Stack, Tooltip, Icon } from 'sheodox-ui';
	import UserLink from './UserLink.svelte';
	import Markdown from './Markdown.svelte';
	import VoteButtons from './VoteButtons.svelte';
	import RelativeTime from './RelativeTime.svelte';
	import UserBadges from './feeds/posts/UserBadges.svelte';
	import LogButton from './LogButton.svelte';
	import type { CommentView } from 'lemmy-js-client';
	import BusyButton from './BusyButton.svelte';
	import IconButton from './IconButton.svelte';
	import IconLink from './IconLink.svelte';
	import CommentEditor from './CommentEditor.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getAppContext } from './app-context';
	import Spinner from './Spinner.svelte';
	import CommunityLink from './CommunityLink.svelte';
	import EllipsisText from '$lib/EllipsisText.svelte';
	import { getCommentContextId } from './nav-utils';
	import { getLemmyClient } from './lemmy-client';
	import { createStatefulForm, type ActionFn, createStatefulAction } from './utils';

	const dispatch = createEventDispatcher<{
		collapse: void;
		'new-comment': CommentView;
		'update-comment': CommentView;
	}>();

	export let searchNonMatch = false;
	export let commentView: CommentView;
	export let postOP: string;
	export let collapsed = false;
	export let showPost = false;

	const { loggedIn, username, checkUnread } = getAppContext();
	const { jwt, client } = getLemmyClient();
	$: myComment = commentView.creator.local && commentView.creator.name === username;

	let showReplyComposer = false;
	let showCommentEdit = false;
	let deletePending = false;
	let maybeDeleting = false;
	let replyForm: HTMLFormElement;
	let editForm: HTMLFormElement;
	$: replyState = createStatefulForm(replyForm, replySubmit);
	$: editState = createStatefulForm(editForm, editSubmit);
	$: voteState = createStatefulAction<number>(async (score) => {
		if (!jwt) {
			return;
		}

		const newCV = await client
			.likeComment({
				auth: jwt,
				comment_id: commentView.comment.id,
				score
			})
			.then((r) => r.comment_view);

		dispatch('update-comment', newCV);
	});

	$: someActionPending =
		showReplyComposer || showCommentEdit || deletePending || $voteState.busy || $replyState.busy || $editState.busy;

	$: collapseMsg = collapsed ? 'Show comment' : 'Hide comment';
	$: contextCommentId = getCommentContextId(commentView);

	const replySubmit: ActionFn = async (body) => {
		if (!jwt) {
			return;
		}
		const parent_id = body.parentId ? Number(body.parentId) : undefined;

		const res = await client.createComment({
			content: body.content as string,
			auth: jwt,
			post_id: commentView.post.id,
			parent_id,
			language_id: body.languageId ? Number(body.languageId) : undefined
		});

		showReplyComposer = false;
		dispatch('new-comment', res.comment_view);

		// replying to an unread comment marks it as read,
		// so if it was one of those, we should check again
		checkUnread();
	};

	const editSubmit: ActionFn = async (body) => {
		if (!jwt) {
			return;
		}

		const res = await client.editComment({
			content: body.content as string,
			auth: jwt,
			comment_id: Number(body.commentId),
			language_id: body.languageId ? Number(body.languageId) : undefined
		});

		showCommentEdit = false;
		dispatch('update-comment', res.comment_view);
	};

	$: deleteState = createStatefulAction<boolean>(async (deleted) => {
		if (!jwt) {
			return;
		}

		const res = await client.deleteComment({
			auth: jwt,
			comment_id: commentView.comment.id,
			deleted
		});

		dispatch('update-comment', res.comment_view);
		maybeDeleting = false;
	});
</script>
