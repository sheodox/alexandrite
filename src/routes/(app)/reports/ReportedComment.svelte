<style lang="scss">
	.content {
		:global(:first-child) {
			margin-top: 0;
		}
		:global(:last-child) {
			margin-bottom: 0;
		}
	}
</style>

<Stack gap={2} dir="c">
	<Stack gap={1} dir="r" align="center">
		{#if view.comment.removed}
			<span class="sx-badge-red mx-0">Removed</span>
		{/if}
		Comment by <UserLink user={view.creator} />
		<UserBadges
			user={view.comment_creator}
			postOP={view.post.creator_id === view.comment_creator.id}
			bannedFromCommunity={$bannedUsers.get(view.comment_creator.id)}
		/>
		to <CommunityLink community={view.community} />
		<span class="muted"> &centerdot; </span>
		<a href="/post/{view.post.id}" class="inline-link" title={view.post.name}>
			<EllipsisText>{view.post.name}</EllipsisText>
		</a>
		<span class="muted"> &centerdot; </span>
		<a href="/comment/{view.comment.id}">
			<RelativeTime date={view.comment.published} />
		</a>
		{#if view.comment.updated && view.comment.updated !== view.comment.published}
			<RelativeTime date={view.comment.updated} variant="icon" icon="edit" verb="Edited" />
		{/if}
	</Stack>
	{#if view.comment.deleted}
		<p class="muted deleted-msg">Deleted by creator</p>
	{/if}
	<div class="content">
		<Markdown md={view.comment.content} />
	</div>
	<Stack gap={2} dir="r" align="center">
		<IconLink icon="link" text="Show in context" href="/comment/{contextCommentId}" cl="tertiary m-0" />
		<BusyButton
			busy={$removeState.busy}
			on:click={$removeState.submit}
			cl="m-0 {view.comment.removed ? '' : 'tertiary'}"
			icon={view.comment.removed ? 'recycle' : 'trash-can'}>{view.comment.removed ? 'Restore' : 'Remove'}</BusyButton
		>
		<BanButton
			banned={bannedFromCommunity}
			personId={view.comment_creator.id}
			communityId={view.community.id}
			on:ban={onBan}
		/>
		<LogButton on:click={() => console.log(view)} />
	</Stack>

	<Report
		busy={$toggleResolvedState.busy}
		on:resolve={(e) => $toggleResolvedState.submit(e.detail)}
		creator={view.creator}
		reason={view.comment_report.reason}
		resolved={view.comment_report.resolved}
		resolver={view.resolver}
		communityId={view.community.id}
		on:ban={onBan}
	/>
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Markdown from '$lib/Markdown.svelte';
	import Report from './Report.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import IconLink from '$lib/IconLink.svelte';
	import type { BanFromCommunityResponse, CommentReportView } from 'lemmy-js-client';
	import UserLink from '$lib/UserLink.svelte';
	import UserBadges from '$lib/feeds/posts/UserBadges.svelte';
	import BanButton from './BanButton.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import EllipsisText from '$lib/EllipsisText.svelte';
	import RelativeTime from '$lib/RelativeTime.svelte';
	import { commentReportViewToContentView, getContentViewStore } from '$lib/content-views';
	import { createStatefulAction } from '$lib/utils';
	import { getLemmyClient } from '$lib/lemmy-client';
	import { getAppContext } from '$lib/app-context';
	import { getCommentContextId } from '$lib/nav-utils';
	import { getBannedUsersStore } from './banned-users-context';
	import LogButton from '$lib/LogButton.svelte';

	export let view: CommentReportView;
	export let bannedFromCommunity: boolean;

	const { checkUnreadReports } = getAppContext();
	const { client, jwt } = getLemmyClient();
	const cvStore = getContentViewStore();
	const bannedUsers = getBannedUsersStore();

	$: toggleResolvedState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		const res = await client.resolveCommentReport({
			auth: jwt,
			report_id: view.comment_report.id,
			resolved: !view.comment_report.resolved
		});
		cvStore.updateView(commentReportViewToContentView(res.comment_report_view));

		checkUnreadReports();
	});
	$: contextCommentId = getCommentContextId(view);
	const removeState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}
		const res = await client.removeComment({
			auth: jwt,
			comment_id: view.comment.id,
			removed: !view.comment.removed
		});

		cvStore.updateView(
			commentReportViewToContentView({
				...view,
				comment: res.comment_view.comment
			})
		);
	});

	function onBan(e: CustomEvent<BanFromCommunityResponse>) {
		cvStore.updateView(
			commentReportViewToContentView({
				...view,
				creator_banned_from_community: e.detail.banned
			})
		);
	}
</script>
