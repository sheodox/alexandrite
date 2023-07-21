<style>
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
			{#if contentView.view.comment.distinguished}
				{@const text = 'Distinguished by moderator'}
				<!-- maybe use a different word, you can distinguish non-mods -->
				<Tooltip>
					<span slot="tooltip">{text}</span>
					<span class="sx-badge-green sx-font-size-2"
						><Icon icon="shield-halved" /><span class="sr-only">{text}</span></span
					>
				</Tooltip>
			{/if}
			<UserLink user={contentView.view.creator} isOP={comment.creator_id === contentView.view.post.creator_id} />
			<UserBadges
				user={contentView.view.creator}
				{postOP}
				bannedFromCommunity={contentView.view.creator_banned_from_community}
			/>
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
			<div class="f-1" />

			{#if parentComment}
				<Tooltip placement="left">
					<ParentComment view={parentComment} slot="tooltip" />
					<Icon icon="turn-up" cl="muted" />
				</Tooltip>
			{/if}
		</Stack>
		{#if !collapsed}
			<div class="comment-content">
				{#if comment.deleted}
					<p class="muted deleted-msg">Deleted by creator</p>
				{:else if comment.removed}
					<p class="muted deleted-msg">Removed by moderator</p>
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
						<IconButton
							text={contentView.view.saved ? 'Saved' : 'Save'}
							variant={contentView.view.saved ? 'solid' : 'regular'}
							pressed={contentView.view.saved}
							busy={$saveState.busy}
							small
							icon="star"
							on:click={$saveState.submit}
							disabled={$saveState.busy}
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
	<ReasonModal on:reason={(e) => $reportState.submit(e)} bind:visible={showReportModal} busy={$reportState.busy} />
{/if}

<script lang="ts">
	import { Stack, Tooltip, Icon, createAutoExpireToast } from 'sheodox-ui';
	import UserLink from '../UserLink.svelte';
	import Markdown from '../Markdown.svelte';
	import VoteButtons from '../VoteButtons.svelte';
	import RelativeTime from '../RelativeTime.svelte';
	import ExtraActions from '../ExtraActions.svelte';
	import UserBadges from '../feeds/posts/UserBadges.svelte';
	import LogButton from '../LogButton.svelte';
	import type { CommentView } from 'lemmy-js-client';
	import BusyButton from '../BusyButton.svelte';
	import ReasonModal from '../ReasonModal.svelte';
	import IconButton from '../IconButton.svelte';
	import IconLink from '../IconLink.svelte';
	import CommentEditor from './CommentEditor.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getAppContext } from '../app-context';
	import Spinner from '../Spinner.svelte';
	import ParentComment from './ParentComment.svelte';
	import CommunityLink from '../CommunityLink.svelte';
	import EllipsisText from '$lib/EllipsisText.svelte';
	import { getCommentContextId } from '../nav-utils';
	import { getLemmyClient } from '../lemmy-client';
	import { createStatefulForm, type ActionFn, createStatefulAction, type ExtraAction } from '../utils';
	import { getVirtualFeedBuffer } from '../virtual-feed';
	import {
		commentViewToContentView,
		getContentViewStore,
		mentionViewToContentView,
		type ContentViewComment,
		type ContentViewMention,
		type ContentViewReply,
		replyViewToContentView
	} from '../content-views';
	import { getModActionPending, getModContext } from '../mod/mod-context';

	const dispatch = createEventDispatcher<{
		collapse: void;
		'new-comment': CommentView;
	}>();

	const cvStore = getContentViewStore();

	const modContext = getModContext();

	export let searchNonMatch = false;
	export let contentView: ContentViewComment | ContentViewReply | ContentViewMention;
	export let postOP: string;
	export let collapsed = false;
	// whether to show a link to the post, used when comments are presented outside of context (inbox/reports/search etc)
	export let showPost = false;
	export let parentComment: CommentView | undefined = undefined;

	// need to assign before the reactivity or the consts below don't work
	let comment = contentView.view.comment;
	$: comment = contentView.view.comment;

	const { loggedIn, username, checkUnread, siteMeta } = getAppContext();
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
	$: isCommunityModerator =
		siteMeta.my_user?.moderates?.some((m) => m.community.id === contentView.communityId) ?? false;

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

	$: saveState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}
		const res = await client.saveComment({
			auth: jwt,
			comment_id: contentView.view.comment.id,
			save: !contentView.view.saved
		});
		updateCV(res.comment_view);
	});

	const reportState = createStatefulAction(async (e: CustomEvent<string>) => {
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
			message: 'Comment Reported'
		});
	});

	// TODO store block state in buffer and allow unblocking from any of their comments?
	const blockUserState = createStatefulAction<boolean>(async (block) => {
		if (!jwt) {
			return;
		}
		await client.blockPerson({
			auth: jwt,
			person_id: contentView.view.creator.id,
			block
		});

		createAutoExpireToast({
			message: `${contentView.view.creator.name} was blocked.`
		});
	});

	const distinguishPending = getModActionPending('distinguish-comment', contentView.view.comment.id);

	async function onDistinguish() {
		const res = await modContext.distinguishComment({
			commentId: contentView.view.comment.id,
			distinguished: !contentView.view.comment.distinguished
		});

		if (res) {
			cvStore.updateView(commentViewToContentView(res.comment_view));
		}
	}

	const removePending = getModActionPending('remove-comment', contentView.view.comment.id);
	async function onRemove() {
		const res = await modContext.removeComment({
			commentId: contentView.view.comment.id,
			removed: !contentView.view.comment.removed
		});

		if (res) {
			cvStore.updateView(commentViewToContentView(res.comment_view));
		}
	}

	const banPending = getModActionPending('ban-person', contentView.view.creator.id);
	async function onBan() {
		const res = await modContext.banPerson({
			personName: contentView.view.creator.display_name || contentView.view.creator.name,
			personId: contentView.view.creator.id,
			communityId: contentView.view.community.id,
			ban: !contentView.view.creator_banned_from_community
		});

		if (res) {
			cvStore.updateViews((views) => {
				return views.map((view) => {
					if (
						view.type === 'comment' &&
						view.view.creator.id === contentView.view.creator.id &&
						view.communityId === contentView.communityId
					) {
						view.view.creator_banned_from_community = res.banned;
						view.view.creator = res.person_view.person;
					}
					return view;
				});
			});
		}
	}

	let overflowMenuOptions: ExtraAction[] = [];

	$: {
		const options: ExtraAction[] = [];

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
				click: () => $blockUserState.submit(true)
			});
		}
		options.push({
			text: viewSource ? 'Hide Source' : 'View Source',
			icon: 'code',
			click: () => (viewSource = !viewSource)
		});

		if (isCommunityModerator) {
			const removed = contentView.view.comment.removed,
				banned = contentView.view.creator_banned_from_community,
				distinguished = contentView.view.comment.distinguished;

			options.push({
				text: 'Mod - ' + (distinguished ? 'Undistinguish' : 'Distinguish'),
				icon: 'shield-halved',
				click: onDistinguish,
				busy: $distinguishPending
			});

			options.push({
				text: 'Mod - ' + (removed ? 'Restore' : 'Remove'),
				icon: removed ? 'recycle' : 'trash-can',
				click: onRemove,
				busy: $removePending
			});

			options.push({
				text: 'Mod - ' + (banned ? 'Unban' : 'Ban'),
				icon: removed ? 'check' : 'ban',
				click: onBan,
				busy: $banPending
			});
		}

		overflowMenuOptions = options;
	}
</script>
