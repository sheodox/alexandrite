<style lang="scss">
	@use 'sass:math';

	$height: 6rem;
	$aspect: math.div(16, 9);

	.post-title {
		transition: color 0.1s;
		color: var(--sx-gray-25);
		&:hover {
			color: white;
		}
	}
	.thumbnail {
		background: var(--sx-gray-transparent);
		border-radius: 5px;
		overflow: hidden;
		height: #{$height};
		width: #{$height * $aspect};
		flex-shrink: 0;

		:global(img),
		:global(.img) {
			height: 100%;
			width: 100%;
			object-fit: cover;
		}
		:global(.sx-stack) {
			height: 100%;
			width: 100%;
		}
	}

	.embed-content {
		width: 60rem;
		max-width: 100%;
	}

	a.read {
		color: var(--sx-gray-200);
	}

	button,
	.button {
		margin: 0;
	}
</style>

<article class="post px-2 py-1 f-row align-items-center post-mode-{mode}">
	<Stack dir="c" gap={2} cl="w-100">
		<Stack dir="r" gap={3} align="center">
			{@const thumbnailUrl = postView.post.thumbnail_url}
			<div class="vote-column f-column justify-content-center">
				<VoteButtons
					vote={postView.my_vote}
					upvotes={postView.counts.upvotes}
					downvotes={postView.counts.downvotes}
					score={postView.counts.score}
					dir="column"
					on:vote={(e) => $voteState.submit(e.detail)}
					votePending={$voteState.busy}
				/>
			</div>
			<div class="thumbnail">
				{#if thumbnailUrl}
					<Image src={thumbnailUrl} mode="thumbnail" nsfw={postView.post.nsfw} />
				{:else}
					<Stack justify="center" align="center">
						<Icon icon={postView.post.url ? 'arrow-up-right-from-square' : 'comments'} />
					</Stack>
				{/if}
			</div>
			<Stack dir="c" gap={2}>
				<Stack dir="r" gap={2} align="center">
					{#if supportsOverlay && modeList}
						<Tooltip>
							<span slot="tooltip">Open in overlay</span>
							<button on:click={() => dispatch('overlay', postView.post.id)}>
								<span class:muted={postView.counts.comments === 0} class="ws-nowrap">
									<Icon icon="comments" iconVariant="regular" variant="icon-only" />
									{postView.counts.comments}
									{#if postView.unread_comments > 0 && postView.unread_comments < postView.counts.comments}
										<span class="sx-badge-orange">+{postView.unread_comments}</span>
									{/if}
								</span>
								<span class="sr-only">Comments</span>
							</button>
						</Tooltip>
					{/if}
					<a
						href="/post/{postView.post.id}"
						class="sx-font-size-5 post-title"
						data-sveltekit-preload-data="off"
						class:read={postView.read && modeList}>{postView.post.name}</a
					>
					<PostBadges {postView} />
				</Stack>
				{#if postView.post.url && (!probablyImage || !thumbnailUrl)}
					<PrettyExternalLink href={postView.post.url} />
				{/if}
				<Stack dir="r" gap={1} align="center">
					<UserLink user={postView.creator} />
					<UserBadges user={postView.creator} postOP="" />
					to
					<CommunityLink community={postView.community} />
					<span class="muted"> &centerdot; </span>
					<RelativeTime date={postView.post.published} />
					{#if postView.post.updated && postView.post.updated !== postView.post.published}
						<RelativeTime date={postView.post.updated} variant="icon" icon="edit" verb="Edited" />
					{/if}
				</Stack>
				<Stack dir="r" gap={2} align="center">
					{@const text = `${showPost ? 'Hide' : 'Show'} Content`}
					{#if hasEmbeddableContent && modeList}
						<span>
							<Tooltip>
								<span slot="tooltip">{text}</span>
								<a href={postView.post.url} class="button small" on:click|preventDefault={() => (showPost = !showPost)}>
									{#if showPost}
										<Icon icon="eye-slash" variant="icon-only" />
									{:else}
										{#if hasBody || hasEmbedText}
											<Icon icon="newspaper" variant="icon-only" />
										{/if}
										{#if probablyImage}
											<Icon icon="image" variant="icon-only" />
										{/if}
									{/if}
									<span class="sr-only">{text}</span>
								</a>
							</Tooltip>
						</span>
					{/if}
					{#if !readOnly}
						{#if loggedIn}
							<Tooltip>
								<span slot="tooltip"> Save </span>
								<button
									aria-pressed={postView.saved}
									class="small"
									on:click={$saveState.submit}
									disabled={$saveState.busy}
								>
									{#if postView.saved}
										<Icon icon="star" variant="icon-only" />
										<span class="sr-only">Saved</span>
									{:else}
										<Icon icon="star" iconVariant="regular" variant="icon-only" />
										<span class="sr-only">Save</span>
									{/if}
								</button>
							</Tooltip>
						{/if}
						{@const postLinkText = 'Original Post'}
						<Tooltip>
							<span slot="tooltip">{postLinkText}</span>
							<a class="button small" href={postView.post.ap_id} target="_blank" rel="noreferrer noopener">
								<Icon icon="network-wired" variant="icon-only" />
								<span class="sr-only">{postLinkText}</span>
							</a>
						</Tooltip>
						<LogButton text="Log PostView" on:click={() => console.log({ postView })} />
						{#if overflowMenuOptions.length}
							{@const text = 'Extra actions'}
							<Tooltip title={text}>
								<MenuButton triggerClasses="small">
									<span slot="trigger">
										<span class="sr-only">{text}</span>
										<Icon icon="caret-down" variant="icon-only" />
									</span>

									<ul slot="menu">
										{#each overflowMenuOptions as opt}
											<li><a href={opt.href} class="button"><Icon icon={opt.icon} /> {opt.text}</a></li>
										{/each}
									</ul>
								</MenuButton>
							</Tooltip>
						{/if}
					{/if}
				</Stack>
			</Stack>
		</Stack>
		<slot name="beforeEmbed" {hasEmbeddableContent} />
		{#if showPost && hasEmbeddableContent}
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
					by default when necessary, or the user has to click twice to see -->
					<Image src={postView.post.url} />
				{/if}
			</div>
		{/if}
	</Stack>
</article>

<script lang="ts">
	import { Tooltip, Stack, Icon, MenuButton } from 'sheodox-ui';
	import UserBadges from './UserBadges.svelte';
	import Image from '$lib/Image.svelte';
	import UserLink from '$lib/UserLink.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import VoteButtons from '$lib/VoteButtons.svelte';
	import RelativeTime from '$lib/RelativeTime.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { PostView } from 'lemmy-js-client';
	import PrettyExternalLink from '$lib/PrettyExternalLink.svelte';
	import PostBadges from '$lib/PostBadges.svelte';
	import { getAppContext } from '$lib/app-context';
	import LogButton from '$lib/LogButton.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import { createStatefulAction } from '$lib/utils';
	import { getLemmyClient } from '$lib/lemmy-client';

	const dispatch = createEventDispatcher<{
		overlay: number;
		'update-post-view': PostView;
	}>();

	const { username, loggedIn } = getAppContext();
	const { client, jwt } = getLemmyClient();

	export let postView: PostView;
	export let mode: 'show' | 'list' = 'list';
	export let readOnly = false;
	export let supportsOverlay = true;
	// viewing multiple posts, show a preview
	$: modeList = mode === 'list';
	// viewing a single post, show everything
	$: modeShow = mode === 'show';

	export let showPost = false;

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

		postView.my_vote = pv.my_vote;
		postView.counts.score = pv.counts.score;
		dispatch('update-post-view', pv);
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

		postView.saved = pv.saved;
		dispatch('update-post-view', pv);
	});

	$: probablyImage = hasImageExtension(postView.post.url || '');
	$: hasBody = !!postView.post.body;
	$: hasEmbedText = !!postView.post.embed_title;
	$: hasEmbeddableContent = probablyImage || hasBody || hasEmbedText;
	$: isMyPost = postView.creator.local && postView.creator.name === username;

	$: overflowMenuOptions = getOverflowMenu(postView, isMyPost);

	function getOverflowMenu(postView: PostView, isMyPost: boolean) {
		const options: { text: string; href: string; icon: string }[] = [],
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

		return options;
	}

	onMount(async () => {
		if (mode === 'show' && loggedIn && jwt) {
			// getting the post has a side effect of marking comments as read
			const pv = await client.getPost({ id: postView.post.id, auth: jwt }).then(({ post_view }) => post_view);

			dispatch('update-post-view', {
				...pv,
				unread_comments: 0,
				read: true
			});
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
