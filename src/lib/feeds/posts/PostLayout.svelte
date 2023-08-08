<style lang="scss">
	button {
		margin: 0;
	}
</style>

<svelte:component this={component} bind:postView on:overlay>
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
					icon="star"
					on:click={$saveState.submit}
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
			<ExtraActions actions={overflowMenuOptions} />
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

{#if layout === 'LIST' && !lastOfList}
	<hr class="w-100" />
{/if}

<slot name="before-embed" />

{#if expandPostContent}
	<div class="mx-2">
		<PostContent {postView} {viewSource} />
	</div>
{/if}

{#if showReportModal}
	<ReasonModal on:reason={(e) => $reportState.submit(e)} bind:visible={showReportModal} busy={$reportState.busy} />
{/if}

<script lang="ts">
	import { Tooltip, Icon, createAutoExpireToast } from 'sheodox-ui';
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
	import { hasImageExtension } from './post-utils';
	import PostCommentCount from './PostCommentCount.svelte';

	export let postView: PostView;
	export let readOnly = false;
	export let supportsOverlay = true;
	export let expandPostContent: boolean;
	export let viewSource = false;
	export let forceLayout: PostPreviewLayout | undefined = undefined;
	export let lastOfList = true;

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	const cvStore = getContentViewStore();
	const modContext = getModContext();
	const { siteMeta } = getAppContext();
	const { postPreviewLayout } = getSettingsContext();

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
	$: isAdminOfCommunity = $siteMeta.my_user?.local_user_view.person.admin && postView.community.local;
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
				auth: jwt,
				post_id: postView.post.id,
				score: score
			})
			.then((r) => r.post_view);

		// update in place for pages that don't host this post in a list (/post/id /comment/id)
		postView.counts.score = pv.counts.score;
		postView.my_vote = pv.my_vote;
		cvStore.updateView(postViewToContentView(pv));
	});

	$: saveState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		const pv = await client
			.savePost({
				post_id: postView.post.id,
				auth: jwt,
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
			auth: jwt,
			reason: e.detail,
			post_id: postView.post.id
		});

		createAutoExpireToast({
			message: 'Post Reported'
		});
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
		if (loggedIn && !isMyPost) {
			options.push({
				text: 'Send Message',
				href: `/message/${postView.creator.id}`,
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
			// todo appoint as mod
		}

		if (loggedIn && isAdminOfCommunity) {
			options.push({
				text: 'Admin - ' + (postView.post.featured_local ? 'Unpin from local' : 'Pin to local'),
				click: () => onFeature('Local', !postView.post.featured_local),
				icon: 'thumbtack',
				busy: $featureLocalPending
			});
		}

		overflowMenuOptions = options;
	}

	async function onBlockUser() {
		if (!jwt) {
			return;
		}
		await client.blockPerson({
			auth: jwt,
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
			auth: jwt,
			community_id: postView.community.id,
			block: true
		});
		cvStore.blockCommunity(postView.community.id);
	}

	function onExpandToggle() {
		expandPostContent = !expandPostContent;
		dispatch('expand-content', { id: postView.post.id, expanded: expandPostContent });
	}
</script>