<style lang="scss">
	a {
		transition: color 0.1s;
		color: var(--sx-gray-25);
		&:hover {
			color: white !important;
		}
	}
</style>

<Stack dir="c" gap={2}>
	<Stack dir="r" gap={2} align="start">
		<PostThumbnail postView={view} />
		<Stack dir="c" gap={2} align="start">
			<Stack dir="r" gap={2} align="start">
				{#if view.post.removed}
					<span class="sx-badge-red m-0">Removed</span>
				{/if}
				<a href="/post/{view.post.id}" class="sx-font-size-5 post-title" data-sveltekit-preload-data="off">
					{view.post.name}
				</a>
			</Stack>
			{#if view.post.url && (!probablyImage || !view.post.thumbnail_url)}
				<PrettyExternalLink href={view.post.url} />
			{/if}
			<Stack dir="r" gap={1} align="center">
				<UserLink user={view.post_creator} />
				<UserBadges user={view.post_creator} postOP="" bannedFromCommunity={$bannedUsers.get(view.post_creator.id)} />
				to
				<CommunityLink community={view.community} />
				<PostTime postView={view} />
			</Stack>
			<Stack gap={2} dir="r" align="center">
				<BusyButton
					busy={$removePending}
					on:click={onRemovePost}
					cl={view.post.removed ? '' : 'tertiary'}
					icon={view.post.removed ? 'recycle' : 'trash-can'}>{view.post.removed ? 'Restore' : 'Remove'}</BusyButton
				>
				<BanButton
					banned={bannedFromCommunity}
					personId={view.post_creator.id}
					communityId={view.community.id}
					personName={view.post_creator.display_name || view.post_creator.name}
					on:ban={onBan}
				/>
				<LogButton on:click={() => console.log(view)} />
			</Stack>
		</Stack>
	</Stack>
	<Report
		busy={$toggleResolvedState.busy}
		on:resolve={(e) => $toggleResolvedState.submit(e.detail)}
		creator={view.creator}
		reason={view.post_report.reason}
		resolved={view.post_report.resolved}
		resolver={view.resolver}
		communityId={view.community.id}
		on:ban={onBan}
	/>
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import Report from './Report.svelte';
	import type { BanFromCommunityResponse, PostReportView } from 'lemmy-js-client';
	import BusyButton from '$lib/BusyButton.svelte';
	import PostThumbnail from '$lib/feeds/posts/PostThumbnail.svelte';
	import PrettyExternalLink from '$lib/PrettyExternalLink.svelte';
	import BanButton from './BanButton.svelte';
	import UserLink from '$lib/UserLink.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import UserBadges from '$lib/feeds/posts/UserBadges.svelte';
	import PostTime from '$lib/feeds/posts/PostTime.svelte';
	import { createStatefulAction } from '$lib/utils';
	import { getLemmyClient } from '$lib/lemmy-client';
	import { getContentViewStore, postReportViewToContentView } from '$lib/content-views';
	import { getAppContext } from '$lib/app-context';
	import { getBannedUsersStore } from './banned-users-context';
	import LogButton from '$lib/LogButton.svelte';
	import { getModActionPending, getModContext } from '$lib/mod/mod-context';

	const { client, jwt } = getLemmyClient();
	const cvStore = getContentViewStore();
	const modContext = getModContext();
	const { checkUnreadReports } = getAppContext();

	export let view: PostReportView;
	export let bannedFromCommunity: boolean;

	$: probablyImage = hasImageExtension(view.post.url || '');

	const bannedUsers = getBannedUsersStore();

	const removePending = getModActionPending('remove-post', view.post.id);
	async function onRemovePost() {
		const res = await modContext.removePost({
			postId: view.post.id,
			removed: !view.post.removed
		});

		if (res) {
			// update all views instead of just one, in case there are multiple reports,
			// we want to accurately reflect the deleted steate
			cvStore.updateViews((views) => {
				return views.map((v) => {
					if (v.type === 'post-report' && v.view.post.id === view.post.id) {
						v.view = {
							...v.view,
							...res.post_view
						};
					}
					return v;
				});
			});
		}
	}

	function hasImageExtension(url: string) {
		if (!url) {
			return false;
		}
		const u = new URL(url);
		return /\.(png|jpg|jpeg|webp)$/.test(u.pathname);
	}

	$: toggleResolvedState = createStatefulAction<boolean>(async (resolved) => {
		if (!jwt) {
			return;
		}

		const res = await client.resolvePostReport({
			auth: jwt,
			report_id: view.post_report.id,
			resolved
		});
		cvStore.updateView(postReportViewToContentView(res.post_report_view));

		checkUnreadReports();
	});

	function onBan(e: CustomEvent<BanFromCommunityResponse>) {
		cvStore.updateView(
			postReportViewToContentView({
				...view,
				creator_banned_from_community: e.detail.banned
			})
		);
	}
</script>
