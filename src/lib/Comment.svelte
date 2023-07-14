<style>
	.comment-content :global(:first-child) {
		margin-top: 0;
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
						<Icon icon={collapsed ? 'chevron-right' : 'chevron-down'} />
						<span class="sr-only">{collapseMsg}</span>
					</button>
				</Tooltip>
			{/if}
			<UserLink user={contentView.view.creator} />
			<UserBadges user={contentView.view.creator} {postOP} />
			{#if showPost}
				to <CommunityLink community={contentView.view.community} />
				<span class="muted"> &centerdot; </span>
				<a href="/post/{contentView.view.post.id}" class="inline-link" title={contentView.view.post.name}>
					<EllipsisText>{contentView.view.post.name}</EllipsisText>
				</a>
			{/if}
			<span class="muted"> &centerdot; </span>
			<a href="/comment/{comment.id}">
				<RelativeTime date={comment.published} />
			</a>
			{#if comment.updated && comment.updated !== comment.published}
				<RelativeTime date={comment.updated} variant="icon" icon="edit" verb="Edited" />
			{/if}
		</Stack>
		{#if !collapsed}
			<div class="comment-content">
				{#if comment.deleted}
					<p class="muted deleted-msg">Deleted by creator</p>
				{:else}
					<Markdown md={comment.content} {viewSource} />
				{/if}
			</div>
			<Stack dir="r" gap={2} align="center">
				<slot name="actions-start" />
				<VoteButtons
					vote={contentView.view.my_vote}
					score={contentView.view.counts.score}
					upvotes={contentView.view.counts.upvotes}
					downvotes={contentView.view.counts.downvotes}
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
					<LogButton on:click={() => console.log({ commentView: contentView })} />
					{#if loggedIn}
						<IconButton
							icon="reply"
							small
							text="Reply"
							on:click={() => ($buffer[bk.showReplyComposer] = true)}
							disabled={someActionPending}
						/>
						{#if myComment}
							<IconButton
								icon="edit"
								small
								text="Edit"
								on:click={() => ($buffer[bk.showEditComposer] = true)}
								disabled={someActionPending}
							/>
							{#if comment.deleted}
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
					<ExtraActions actions={overflowMenuOptions} />
				{/if}
				{#if deletePending}
					<Spinner />
				{/if}
			</Stack>
		{/if}
		{#if $buffer[bk.showEditComposer]}
			<form bind:this={editForm} class="reply-editor">
				<input type="hidden" name="commentId" value={comment.id} />
				<CommentEditor
					bind:value={$buffer[bk.editText]}
					selectedLanguage={comment.language_id}
					cancellable
					label="Edit"
					on:cancel={() => ($buffer[bk.showEditComposer] = false)}
					submitting={$editState.busy}
				/>
			</form>
		{/if}
		{#if $buffer[bk.showReplyComposer] && loggedIn}
			<form bind:this={replyForm} class="reply-editor">
				<input type="hidden" name="parentId" value={comment.id} />
				<CommentEditor
					cancellable
					bind:value={$buffer[bk.replyText]}
					on:cancel={() => ($buffer[bk.showReplyComposer] = false)}
					submitting={$replyState.busy}
				/>
			</form>
		{/if}
	</Stack>
</section>

{#if showReportModal}
	<ReportModal on:report={onReport} bind:visible={showReportModal} />
{/if}

<script lang="ts">
	import { Stack, Tooltip, Icon, createAutoExpireToast } from 'sheodox-ui';
	import UserLink from './UserLink.svelte';
	import Markdown from './Markdown.svelte';
	import VoteButtons from './VoteButtons.svelte';
	import RelativeTime from './RelativeTime.svelte';
	import ExtraActions from './ExtraActions.svelte';
	import UserBadges from './feeds/posts/UserBadges.svelte';
	import LogButton from './LogButton.svelte';
	import type { CommentView } from 'lemmy-js-client';
	import BusyButton from './BusyButton.svelte';
	import ReportModal from './ReportModal.svelte';
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
	import { createStatefulForm, type ActionFn, createStatefulAction, type ExtraAction } from './utils';
	import { getVirtualFeedBuffer } from './virtual-feed';
	import {
		commentViewToContentView,
		getContentViewStore,
		mentionViewToContentView,
		type ContentViewComment,
		type ContentViewMention,
		type ContentViewReply,
		replyViewToContentView
	} from './content-views';

	const dispatch = createEventDispatcher<{
		collapse: void;
		'new-comment': CommentView;
	}>();

	const cvStore = getContentViewStore();

	export let searchNonMatch = false;
	export let contentView: ContentViewComment | ContentViewReply | ContentViewMention;
	export let postOP: string;
	export let collapsed = false;
	export let showPost = false;

	// need to assign before the reactivity or the consts below don't work
	let comment = contentView.view.comment;
	$: comment = contentView.view.comment;

	const { loggedIn, username, checkUnread } = getAppContext();
	const { jwt, client } = getLemmyClient();
	$: myComment = contentView.view.creator.local && contentView.view.creator.name === username;

	const buffer = getVirtualFeedBuffer();
	const bufferKeyBase = `comment-${comment.id}-`;
	// bk = buffer keys, stashing some state in a VirtualFeed context so scrolling
	// doesn't lose important stuff when things unrender
	const bk = {
		showEditComposer: bufferKeyBase + 'showEditComposer',
		showReplyComposer: bufferKeyBase + 'showReplyComposer',
		editText: bufferKeyBase + 'editText',
		replyText: bufferKeyBase + 'replyText'
	};

	// set buffer defaults
	$buffer[bk.showReplyComposer] = $buffer[bk.showReplyComposer] ?? false;
	$buffer[bk.showEditComposer] = $buffer[bk.showEditComposer] ?? false;
	$buffer[bk.replyText] = $buffer[bk.replyText] ?? '';
	$buffer[bk.editText] = $buffer[bk.editText] ?? comment.content;

	let deletePending = false;
	let maybeDeleting = false;
	let viewSource = false;
	let showReportModal = false;
	let replyForm: HTMLFormElement;
	let editForm: HTMLFormElement;
	$: replyState = createStatefulForm(replyForm, replySubmit);
	$: editState = createStatefulForm(editForm, editSubmit);
	$: voteState = createStatefulAction<number>(async (score) => {
		if (!jwt) {
			return;
		}

		const res = await client.likeComment({
			auth: jwt,
			comment_id: comment.id,
			score
		});

		// for some types that show as a comment there is extra data, but it's not returned with the like,
		// so we pull it from the existing view, as it won't have changed
		if (contentView.type === 'mention') {
			cvStore.updateView(
				mentionViewToContentView({
					...res.comment_view,
					person_mention: contentView.view.person_mention,
					recipient: contentView.view.recipient
				})
			);
		} else if (contentView.type === 'reply') {
			cvStore.updateView(
				replyViewToContentView({
					...res.comment_view,
					comment_reply: contentView.view.comment_reply,
					recipient: contentView.view.recipient
				})
			);
		} else {
			cvStore.updateView(commentViewToContentView(res.comment_view));
		}
	});

	$: someActionPending =
		$buffer[bk.showReplyComposer] ||
		$buffer[bk.showEditComposer] ||
		deletePending ||
		$voteState.busy ||
		$replyState.busy ||
		$editState.busy;

	$: collapseMsg = collapsed ? 'Show comment' : 'Hide comment';
	$: contextCommentId = getCommentContextId(contentView.view);

	function updateCV(commentView: CommentView) {
		cvStore.updateView(commentViewToContentView(commentView));
	}

	const replySubmit: ActionFn = async (body) => {
		if (!jwt) {
			return;
		}
		const parent_id = body.parentId ? Number(body.parentId) : undefined;

		const res = await client.createComment({
			content: body.content as string,
			auth: jwt,
			post_id: contentView.view.post.id,
			parent_id,
			language_id: body.languageId ? Number(body.languageId) : undefined
		});

		$buffer[bk.showReplyComposer] = false;
		$buffer[bk.replyText] = '';
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

		$buffer[bk.showEditComposer] = false;
		updateCV(res.comment_view);
	};

	$: deleteState = createStatefulAction<boolean>(async (deleted) => {
		if (!jwt) {
			return;
		}

		const res = await client.deleteComment({
			auth: jwt,
			comment_id: comment.id,
			deleted
		});

		updateCV(res.comment_view);
		maybeDeleting = false;
	});

	async function toggleSaveComment() {
		if (!jwt) {
			return;
		}
		const res = await client.saveComment({
			auth: jwt,
			comment_id: contentView.view.comment.id,
			save: !contentView.view.saved
		});

		updateCV(res.comment_view);
	}

	async function onReport(e: CustomEvent<string>) {
		if (!jwt) {
			return;
		}
		await client.createCommentReport({
			auth: jwt,
			reason: e.detail,
			comment_id: contentView.view.comment.id
		});

		showReportModal = false;
		createAutoExpireToast({
			title: 'Comment Reported',
			message: ''
		});
	}

	async function onBlockUser() {
		if (!jwt) {
			return;
		}
		await client.blockPerson({
			auth: jwt,
			person_id: contentView.view.creator.id,
			block: true
		});

		createAutoExpireToast({
			title: 'Blocked',
			message: `${contentView.view.creator.name} was blocked.`
		});
	}

	let overflowMenuOptions: ExtraAction[] = [];

	$: {
		const options: ExtraAction[] = [];

		if (loggedIn) {
			const saved = contentView.view.saved;
			options.push({
				text: saved ? 'Unsave' : 'Save',
				icon: 'star',
				variant: saved ? 'solid' : 'regular',
				click: toggleSaveComment
			});
		}

		if (loggedIn && !myComment) {
			options.push({
				text: 'Send Message',
				href: `/message/${contentView.view.creator.id}`,
				icon: 'message'
			});

			options.push({
				text: 'Report',
				icon: 'flag',
				click: () => (showReportModal = true)
			});

			options.push({
				text: 'Block user',
				icon: 'user-slash',
				click: onBlockUser
			});
		}

		options.push({
			text: viewSource ? 'Hide Source' : 'View Source',
			icon: 'code',
			click: () => (viewSource = !viewSource)
		});

		overflowMenuOptions = options;
	}
</script>
