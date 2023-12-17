<style lang="scss">
	button,
	.button {
		margin: 0;
	}
</style>

<svelte:component this={component} bind:postView on:overlay {supportsOverlay} {mode}>
	<svelte:fragment slot="vote-buttons" let:small let:dir>
		<!-- TS doesn't realize i'm only passing valid values, it sees dir as type string -->
		<PostVoteButtons {postView} {voteState} {small} dir={dir === 'row' ? 'row' : 'column'} />
	</svelte:fragment>

	<svelte:fragment slot="creator">
		<UserLink user={postView.creator} />
		<UserBadges
			user={postView.creator}
			postOP=""
			bannedFromCommunity={postView.creator_banned_from_community}
			community={postView.community}
		/>
	</svelte:fragment>

	<svelte:fragment slot="community">
		<CommunityLink community={postView.community} />
	</svelte:fragment>

	<svelte:fragment slot="post-link">
		{#if postView.post.url && (!probablyImage || !postView.post.thumbnail_url)}
			<PrettyExternalLink href={postView.post.url} />
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="actions">
		<Tooltip>
			<span slot="tooltip"
				>Comments {#if postView.unread_comments > 0}<span class="sx-badge-orange">+Unread</span>{/if}</span
			>
			{#if supportsOverlay}
				<button on:click={() => dispatch('overlay', postView.post.id)} class="small">
					<PostCommentCount {postView} />
				</button>
			{:else}
				<PostCommentCount {postView} />
			{/if}
		</Tooltip>
		{#if !readOnly}
			{#if loggedIn}
				<IconButton
					text={postView.saved ? 'Saved' : 'Save'}
					variant={postView.saved ? 'solid' : 'regular'}
					pressed={postView.saved}
					busy={$saveState.busy}
					small
					cl="m-0"
					icon="star"
					on:click={() => $saveState.submit()}
					disabled={$saveState.busy}
				/>
			{/if}
			{@const postLinkText = 'Original Post'}
			<Tooltip>
				<span slot="tooltip">{postLinkText}</span>
				<a class="button small" href={postView.post.ap_id} target="_blank" rel="noreferrer noopener">
					<Icon icon="network-wired" />
					<span class="sr-only">{postLinkText}</span>
				</a>
			</Tooltip>
			<LogButton text="Log PostView" on:click={() => console.log({ postView })} />
			<ExtraActions small actions={overflowMenuOptions} on:open={onExtraActionsOpen} />
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="embed-expand">
		{@const text = `${expandPostContent ? 'Hide' : 'Show'} Content`}
		{#if hasEmbeddableContent && layoutSupports.expand}
			<span>
				<Tooltip>
					<span slot="tooltip">{text}</span>
					<button class="button small" on:click={onExpandToggle}>
						{#if expandPostContent}
							<Icon icon="eye-slash" />
						{:else}
							{#if hasBody || hasEmbedText}
								<Icon icon="newspaper" />
							{/if}
							{#if probablyImage}
								<Icon icon="image" />
							{/if}
						{/if}
						<span class="sr-only">{text}</span>
					</button>
				</Tooltip>
			</span>
		{/if}
	</svelte:fragment>
</svelte:component>

{#if crossPosts?.length}
	<Stack dir="r" gap={1} cl="f-wrap ml-2 mb-4">
		Cross-posted to:
		{#each crossPosts as pv}
			<CommunityLink href="/{$profile.instance}/post/{pv.post.id}" community={pv.community} />
		{/each}
	</Stack>
{/if}

<slot name="before-embed" />

{#if expandPostContent}
	<div class="mx-2">
		<PostContent {postView} />
	</div>
{/if}

{#if showReportModal}
	<ReasonModal on:reason={(e) => $reportState.submit(e)} bind:visible={showReportModal} busy={$reportState.busy} />
{/if}

{#if layout === 'LIST' && !lastOfList}
	<hr class="w-100" />
{/if}

<script lang="ts">
	import { Stack, Tooltip, Icon, createAutoExpireToast } from 'sheodox-ui';
	import { getAppContext } from '$lib/app-context';
	import { getSettingsContext, type PostPreviewLayout } from '$lib/settings-context';
	import CardPostPreview from './previews/CardPostPreview.svelte';
	import ListPostPreview from './previews/ListPostPreview.svelte';
	import PostContent from './PostContent.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import PrettyExternalLink from '$lib/PrettyExternalLink.svelte';
	import CompactPostPreview from './previews/CompactPostPreview.svelte';
	import UserLink from '$lib/UserLink.svelte';
	import IconButton from '$lib/IconButton.svelte';
	import ReasonModal from '$lib/ReasonModal.svelte';
	import LogButton from '$lib/LogButton.svelte';
	import UserBadges from './UserBadges.svelte';
	import ExtraActions from '$lib/ExtraActions.svelte';
	import type { PostFeatureType, PostView } from 'lemmy-js-client';
	import { createStatefulAction, type ExtraAction } from '$lib/utils';
	import { profile } from '$lib/profiles/profiles';
	import { getContentViewStore, postViewToContentView } from '$lib/content-views';
	import { getModActionPending, getModContext } from '$lib/mod/mod-context';
	import { nameAtInstance } from '$lib/nav-utils';
	import PostVoteButtons from './PostVoteButtons.svelte';
	import { createEventDispatcher } from 'svelte';
	import { hasImageExtension, type PostLayoutAPI } from './post-utils';
	import PostCommentCount from './PostCommentCount.svelte';
	import { getCommunityContext } from '$lib/community-context/community-context';

	export let postView: PostView;
	export let readOnly = false;
	export let supportsOverlay = true;
	export let expandPostContent: boolean;
	export let forceLayout: PostPreviewLayout | undefined = undefined;
	export let mode: 'show' | 'list' = 'list';
	// if this is the last post in a list of posts, controls whether a
	// separator is shown below the post on some layouts
	export let lastOfList = true;
	export let crossPosts: PostView[] | null = null;
	// export only! don't pass a value
	export let api: PostLayoutAPI | undefined = undefined;

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	const cvStore = getContentViewStore();
	const modContext = getModContext();
	const { siteMeta } = getAppContext();
	const { weaklyGetCommunity, getFullCommunity } = getCommunityContext();
	const { postPreviewLayout, showModlogWarning, showModlogWarningModerated } = getSettingsContext();

	$: layout = forceLayout ?? $postPreviewLayout;

	$: client = $profile.client;
	$: jwt = $profile.jwt;
	$: loggedIn = $profile.loggedIn;
	$: username = $profile.username;
	$: probablyImage = hasImageExtension(postView.post.url || '');
	$: hasBody = !!postView.post.body;
	$: hasEmbedText = !!postView.post.embed_title;
	$: hasEmbeddableContent = probablyImage || hasBody || hasEmbedText;
	$: isMyPost = postView.creator.local && postView.creator.name === username;
	$: isCommunityModerator =
		$siteMeta.my_user?.moderates?.some((m) => m.community.id === postView.community.id) ?? false;
	$: isAdmin = $siteMeta.admins.some(
		(admin) => admin.person.actor_id === $siteMeta.my_user?.local_user_view.person.actor_id
	);
	$: isAdminOfCommunity = isAdmin && postView.community.local;
	$: communityName = nameAtInstance(postView.community);
	$: community = weaklyGetCommunity(communityName);
	$: postMadeByModerator = $community?.moderators.some((m) => m.moderator.id === postView.creator.id);
	// we can't show the mod add/remove options unless we know who the mods are
	$: moderatorsUnknown = !$community?.moderators;

	let showReportModal = false;

	$: component = getLayoutComponent(layout);
	$: layoutSupports = getLayoutSupports(layout);

	function getLayoutComponent(
		layout: PostPreviewLayout
	): typeof CardPostPreview | typeof CompactPostPreview | typeof ListPostPreview {
		if (layout === 'CARD') {
			return CardPostPreview;
		} else if (layout === 'COMPACT') {
			return CompactPostPreview;
		}
		return ListPostPreview;
	}

	function getLayoutSupports(layout: PostPreviewLayout) {
		const is = {
			card: layout === 'CARD',
			compact: layout === 'COMPACT',
			list: layout === 'LIST'
		};

		return {
			expand: is.compact || is.list
		};
	}

	$: voteState = createStatefulAction(async (score: number) => {
		if (!jwt) {
			return;
		}

		const pv = await client
			.likePost({
				post_id: postView.post.id,
				score: score
			})
			.then((r) => r.post_view);

		// update in place for pages that don't host this post in a list (/post/id /comment/id)
		postView.counts.score = pv.counts.score;
		postView.my_vote = pv.my_vote;
		cvStore.updateView(postViewToContentView(pv));
	});

	$: saveState = createStatefulAction<void>(async () => {
		if (!jwt) {
			return;
		}

		const pv = await client
			.savePost({
				post_id: postView.post.id,
				save: !postView.saved
			})
			.then(({ post_view }) => post_view);

		postView = pv;
		cvStore.updateView(postViewToContentView(pv));
	});

	const reportState = createStatefulAction(async (e: CustomEvent<string>) => {
		if (!jwt) {
			return;
		}
		await client.createPostReport({
			reason: e.detail,
			post_id: postView.post.id
		});

		createAutoExpireToast({
			message: 'Post Reported'
		});
		showReportModal = false;
	});

	const featureLocalPending = getModActionPending('feature-post-local', postView.post.id);
	const featureCommunityPending = getModActionPending('feature-post-community', postView.post.id);
	async function onFeature(featureType: PostFeatureType, featured: boolean) {
		const res = await modContext.featurePost({
			postId: postView.post.id,
			featured,
			featureType
		});

		if (res) {
			postView = res.post_view;
			cvStore.updateView(postViewToContentView(res.post_view));
		}
	}

	const lockPending = getModActionPending('lock-post', postView.post.id);
	async function onLockPost() {
		const res = await modContext.lockPost({
			postId: postView.post.id,
			locked: !postView.post.locked
		});

		if (res) {
			postView = res.post_view;
			cvStore.updateView(postViewToContentView(res.post_view));
		}
	}

	const removePending = getModActionPending('remove-post', postView.post.id);
	async function onRemovePost() {
		const res = await modContext.removePost({
			postId: postView.post.id,
			removed: !postView.post.removed
		});

		if (res) {
			postView = res.post_view;
			cvStore.updateView(postViewToContentView(res.post_view));
		}
	}

	const banPending = getModActionPending('ban-person', postView.creator.id);
	async function onBan() {
		const res = await modContext.banPerson({
			personName: nameAtInstance(postView.creator, postView.creator.display_name),
			personId: postView.creator.id,
			communityId: postView.community.id,
			ban: !postView.creator_banned_from_community
		});
		if (res) {
			cvStore.updateViews((views) => {
				postView.creator_banned_from_community = res.banned;
				postView.creator = res.person_view.person;

				return views.map((view) => {
					if (
						view.type === 'post' &&
						view.view.creator.id === postView.creator.id &&
						view.communityId === postView.community.id
					) {
						view.view.creator_banned_from_community = res.banned;
						view.view.creator = res.person_view.person;
					}
					return view;
				});
			});
		}
	}

	const modAddPending = getModActionPending('add-mod', `${postView.community.id}-${postView.creator.id}`);
	async function onModAdd() {
		await modContext.addMod({
			added: !postMadeByModerator,
			personName: nameAtInstance(postView.creator, postView.creator.display_name),
			personId: postView.creator.id,
			communityId: postView.community.id
		});
	}

	let overflowMenuOptions: ExtraAction[] = [];

	$: {
		const options: ExtraAction[] = [],
			postId = postView.post.id,
			communityName = nameAtInstance(postView.community),
			postBaseUrl = `/${$profile.instance}/c/${communityName}/post/${postId}/`;

		if (isMyPost) {
			options.push({
				text: 'Edit Post',
				href: postBaseUrl + 'edit',
				icon: 'edit'
			});
			options.push({
				text: 'Delete Post',
				href: postBaseUrl + 'delete',
				icon: 'trash-can'
			});
		}
		if (loggedIn) {
			options.push({
				text: 'Cross-post',
				href: `/${$profile.instance}/create/post?crosspost=${postView.post.id}`,
				icon: 'clone'
			});
		}
		if (loggedIn && !isMyPost) {
			options.push({
				text: 'Send Message',
				href: `/${$profile.instance}/message/${postView.creator.id}`,
				icon: 'message'
			});
			options.push({
				text: 'Report Post',
				click: () => (showReportModal = true),
				icon: 'flag',
				busy: $reportState.busy
			});
			options.push({
				text: 'Block user',
				icon: 'user-slash',
				click: onBlockUser
			});
		}
		if (loggedIn) {
			options.push({
				text: 'Block Community',
				click: blockCommunity,
				icon: 'ban'
			});
		}

		if (loggedIn && isCommunityModerator) {
			options.push({
				text: 'Mod - ' + (postView.post.featured_community ? 'Unpin from community' : 'Pin to community'),
				click: () => onFeature('Community', !postView.post.featured_community),
				icon: 'thumbtack',
				busy: $featureCommunityPending
			});

			options.push({
				text: 'Mod - ' + (postView.post.locked ? 'Unlock' : 'Lock'),
				click: onLockPost,
				icon: postView.post.locked ? 'lock-open' : 'lock',
				busy: $lockPending
			});
			options.push({
				text: 'Mod - ' + (postView.post.removed ? 'Restore' : 'Remove'),
				click: onRemovePost,
				icon: postView.post.removed ? 'recycle' : 'trash-can',
				busy: $removePending
			});
			options.push({
				text: 'Mod - ' + (postView.creator_banned_from_community ? 'Unban' : 'Ban'),
				click: onBan,
				icon: postView.creator_banned_from_community ? 'check' : 'ban',
				busy: $banPending
			});

			options.push({
				text: `Mod - ${postMadeByModerator ? 'Remove mod' : 'Add mod'}`,
				icon: postMadeByModerator ? 'user-minus' : 'user-plus',
				click: onModAdd,
				busy: $modAddPending,
				disabled: moderatorsUnknown
			});
		}

		if (loggedIn && isAdminOfCommunity) {
			options.push({
				text: 'Admin - ' + (postView.post.featured_local ? 'Unpin from local' : 'Pin to local'),
				click: () => onFeature('Local', !postView.post.featured_local),
				icon: 'thumbtack',
				busy: $featureLocalPending
			});
		}

		if (isCommunityModerator || isAdmin) {
			const warn = isCommunityModerator ? $showModlogWarningModerated : $showModlogWarning,
				modlogBase = `/${$profile.instance}/modlog${warn ? '' : '/view'}`;

			options.push({
				text: `Mod - View user modlog in /c/${postView.community.name}`,
				href: modlogBase + `?community=${postView.community.id}&target=${postView.creator.id}`,
				icon: 'shield-halved'
			});

			options.push({
				text: `Mod - View user modlog`,
				href: modlogBase + `?target=${postView.creator.id}`,
				icon: 'shield-halved'
			});
		}

		overflowMenuOptions = options;
	}

	function onExtraActionsOpen() {
		// load moderators when actions opened, so we know if the user is a mod of this community already
		getFullCommunity(postView.community);
	}

	async function onBlockUser() {
		if (!jwt) {
			return;
		}
		await client.blockPerson({
			person_id: postView.creator.id,
			block: true
		});

		createAutoExpireToast({
			message: `${postView.creator.name} was blocked.`
		});
	}

	async function blockCommunity() {
		if (
			!jwt ||
			!confirm(`Are you sure you want to block "${nameAtInstance(postView.community, postView.community.title)}"?`)
		) {
			return;
		}
		await client.blockCommunity({
			community_id: postView.community.id,
			block: true
		});
		cvStore.blockCommunity(postView.community.id);
	}

	function onExpandToggle() {
		expandPostContent = !expandPostContent;
		dispatch('expand-content', { id: postView.post.id, expanded: expandPostContent });
	}

	// expose some methods to the post feed, so it can handle hotkeys
	$: api = {
		// undo the vote if it's already that vote
		upvote: () => $voteState.submit(postView.my_vote === 1 ? 0 : 1),
		downvote: () => $voteState.submit(postView.my_vote === -1 ? 0 : -1),
		save: () => $saveState.submit()
	};
</script>
