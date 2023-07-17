<style lang="scss">
	.embed-content {
		width: 60rem;
		max-width: 100%;
	}

	button,
	.button {
		margin: 0;
	}
</style>

<article class="post px-2 f-row align-items-center post-mode-{mode}">
	<Stack dir="c" gap={2} cl="w-100 py-1">
		<Stack dir="r" gap={3} align="center">
			<PostVoteButtons {postView} {voteState} />
			{#if supportsOverlay}
				<button class="m-0 p-0" on:click={() => dispatch('overlay', postView.post.id)}
					><PostThumbnail {postView} /></button
				>
			{:else}
				<PostThumbnail {postView} />
			{/if}
			<Stack dir="c" gap={2}>
				<PostTitle {postView} on:overlay {modeList} {supportsOverlay} />
				{#if postView.post.url && (!probablyImage || !postView.post.thumbnail_url)}
					<PrettyExternalLink href={postView.post.url} />
				{/if}
				<Stack dir="r" gap={1} align="center">
					<UserLink user={postView.creator} />
					<UserBadges user={postView.creator} postOP="" />
					to
					<CommunityLink community={postView.community} />
				</Stack>
				<Stack dir="r" gap={2} align="center">
					{@const text = `${expandPostContent ? 'Hide' : 'Show'} Content`}
					{#if hasEmbeddableContent && modeList}
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
					{#if modeList}
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
					{/if}
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
					<PostTime {postView} />
				</Stack>
			</Stack>
		</Stack>
		<slot name="beforeEmbed" {hasEmbeddableContent} />
		{#if expandPostContent && hasEmbeddableContent}
			<div class="embed-content">
				{#if hasEmbedText}
					<div class="card m-0 p-2">
						<h2 class="card-title m-0">
							{postView.post.embed_title}
						</h2>
						<div class="card-body">
							{#if postView.post.url}
								<PrettyExternalLink href={postView.post.url} />
							{/if}
							<p>
								{postView.post.embed_description ?? ''}
							</p>
						</div>
					</div>
				{/if}
				{#if hasBody}
					<div>
						<Markdown md={postView.post.body ?? ''} />
					</div>
				{/if}
				{#if probablyImage && postView.post.url}
					<!-- not passing nsfw, it's handled by not showing the post contents
					by default when necessary, or the user has to click twice to see.
					also don't lazy load, as if it's expanded in the feed it has repercussions
					in the feed height, so images can't be lazy -->
					<Image src={postView.post.url} lazy={false} />
				{/if}
			</div>
		{/if}
	</Stack>
</article>

{#if showReportModal}
	<ReportModal on:report={onReport} bind:visible={showReportModal} />
{/if}

<script lang="ts">
	import { Tooltip, Stack, Icon, createAutoExpireToast } from 'sheodox-ui';
	import UserBadges from './UserBadges.svelte';
	import IconButton from '$lib/IconButton.svelte';
	import ExtraActions from '$lib/ExtraActions.svelte';
	import PostTitle from './PostTitle.svelte';
	import Image from '$lib/Image.svelte';
	import UserLink from '$lib/UserLink.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import PostCommentCount from './PostCommentCount.svelte';
	import PostVoteButtons from './PostVoteButtons.svelte';
	import PostThumbnail from './PostThumbnail.svelte';
	import ReportModal from '$lib/ReportModal.svelte';
	import PostTime from './PostTime.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { PostView } from 'lemmy-js-client';
	import PrettyExternalLink from '$lib/PrettyExternalLink.svelte';
	import { getAppContext } from '$lib/app-context';
	import LogButton from '$lib/LogButton.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import { createStatefulAction } from '$lib/utils';
	import { getLemmyClient } from '$lib/lemmy-client';
	import { getContentViewStore, postViewToContentView } from '$lib/content-views';

	const dispatch = createEventDispatcher<{
		overlay: number;
		'expand-content': { id: number; expanded: boolean };
	}>();

	const cvStore = getContentViewStore();

	const { username, loggedIn } = getAppContext();
	const { client, jwt } = getLemmyClient();

	export let postView: PostView;
	export let mode: 'show' | 'list' = 'list';
	export let readOnly = false;
	export let supportsOverlay = true;

	let showReportModal = false;

	// viewing multiple posts, show a preview
	$: modeList = mode === 'list';
	// viewing a single post, show everything

	export let expandPostContent = false;

	function onExpandToggle() {
		expandPostContent = !expandPostContent;
		dispatch('expand-content', { id: postView.post.id, expanded: expandPostContent });
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

		cvStore.updateView(postViewToContentView(pv));
	});

	$: probablyImage = hasImageExtension(postView.post.url || '');
	$: hasBody = !!postView.post.body;
	$: hasEmbedText = !!postView.post.embed_title;
	$: hasEmbeddableContent = probablyImage || hasBody || hasEmbedText;
	$: isMyPost = postView.creator.local && postView.creator.name === username;

	async function onReport(e: CustomEvent<string>) {
		if (!jwt) {
			return;
		}
		await client.createPostReport({
			auth: jwt,
			reason: e.detail,
			post_id: postView.post.id
		});

		showReportModal = false;
		createAutoExpireToast({
			message: 'Post Reported'
		});
	}

	$: overflowMenuOptions = getOverflowMenu(postView, isMyPost);

	function getOverflowMenu(postView: PostView, isMyPost: boolean) {
		const options: { text: string; href?: string; icon: string; click?: () => unknown }[] = [],
			postId = postView.post.id,
			communityName = nameAtInstance(postView.community),
			postBaseUrl = `/c/${communityName}/post/${postId}/`;

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
				icon: 'flag'
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

		return options;
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

	onMount(async () => {
		if (mode === 'show' && loggedIn && jwt) {
			// getting the post has a side effect of marking comments as read
			const pv = await client.getPost({ id: postView.post.id, auth: jwt }).then(({ post_view }) => post_view);
			cvStore.updateView(postViewToContentView(pv));
		}
	});

	function hasImageExtension(url: string) {
		if (!url) {
			return false;
		}
		const u = new URL(url);
		return /\.(png|jpg|jpeg|webp)$/.test(u.pathname);
	}
</script>
