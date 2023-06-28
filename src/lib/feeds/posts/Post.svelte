<style lang="scss">
	@use 'sass:math';

	$height: 6rem;
	$aspect: math.div(16, 9);

	.thumbnail {
		background: var(--sx-gray-transparent);
		border-radius: 5px;
		overflow: hidden;
		height: #{$height};
		width: #{$height * $aspect};
		flex-shrink: 0;

		:global(img) {
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
		max-width: 100%;
		width: 60rem;
	}

	a.read {
		color: var(--sx-gray-200);
	}
</style>

<article class="post px-2 py-1 f-row align-items-center post-mode-{mode}">
	<Stack dir="c" gap={2}>
		<Stack dir="r" gap={2} align="center">
			{@const thumbnailUrl = postView.post.thumbnail_url}
			<div class="vote-column f-column justify-content-center">
				<VoteButtons vote={postView.my_vote} score={postView.counts.score} dir="column" on:vote={vote} {votePending} />
			</div>
			<div class="thumbnail">
				{#if thumbnailUrl}
					<Image src={thumbnailUrl} mode="thumbnail" />
				{:else}
					<Stack justify="center" align="center">
						<Icon icon={postView.post.url ? 'arrow-up-right-from-square' : 'comments'} />
					</Stack>
				{/if}
			</div>
			<Stack dir="c" gap={2}>
				<Stack dir="r" gap={0} align="center">
					<Tooltip>
						<span slot="tooltip">Open in overlay</span>
						{#if modeList}
							<button class="mr-2" on:click={() => dispatch('overlay', postView.post.id)}>
								<span class:muted={postView.counts.comments === 0} class="ws-nowrap">
									<Icon icon="comments" iconVariant="regular" variant="icon-only" />
									{postView.counts.comments}
									{#if postView.unread_comments > 0 && postView.unread_comments < postView.counts.comments}
										<span class="sx-badge-orange">+{postView.unread_comments}</span>
									{/if}
								</span>
								<span class="sr-only">Comments</span>
							</button>
						{/if}
					</Tooltip>
					<a
						href="/post/{postView.post.id}"
						class="sx-font-size-5"
						data-sveltekit-preload-data="off"
						class:read={postView.read}>{postView.post.name}</a
					>
					<PostBadges {postView} />
				</Stack>
				{#if postView.post.url && probablyImage && !thumbnailUrl}
					<PrettyExternalLink href={postView.post.url} />
				{/if}
				<Stack dir="r" gap={2} align="center">
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
					{@const text = `${showPost ? 'Hide' : 'Show'} Post`}
					{#if hasEmbeddableContent && modeList}
						<span>
							<Tooltip>
								<span slot="tooltip">{text}</span>
								<a
									href={postView.post.url}
									class="button small tertiary"
									on:click|preventDefault={() => (showPost = !showPost)}
								>
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
					<Tooltip>
						<span slot="tooltip"> Save </span>
						<button aria-pressed={postView.saved} class="small" on:click={save} disabled={savePending}>
							{#if postView.saved}
								<Icon icon="star" variant="icon-only" />
								<span class="sr-only">Saved</span>
							{:else}
								<Icon icon="star" iconVariant="regular" variant="icon-only" />
								<span class="sr-only">Save</span>
							{/if}
						</button>
					</Tooltip>
					{@const postLinkText = 'Original Post'}
					<Tooltip>
						<span slot="tooltip">{postLinkText}</span>
						<a class="button small" href={postView.post.ap_id} target="_blank" rel="noreferrer noopener">
							<Icon icon="network-wired" variant="icon-only" />
							<span class="sr-only">{postLinkText}</span>
						</a>
					</Tooltip>
					<LogButton text="Log PostView" on:click={() => console.log({ postView })} />
				</Stack>
			</Stack>
		</Stack>
		<slot name="beforeEmbed" />
		{#if modeShow || (showPost && hasEmbeddableContent)}
			<div class="p-2 embed-content">
				{#if hasEmbedText}
					<div class="card">
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
					<Image src={postView.post.url} />
				{/if}
			</div>
		{/if}
	</Stack>
</article>

<script lang="ts">
	import { Tooltip, Stack, Icon } from 'sheodox-ui';
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

	const dispatch = createEventDispatcher<{
		overlay: number;
		'update-post-view': PostView;
	}>();

	export let postView: PostView;
	export let mode: 'show' | 'list' = 'list';
	const { loggedIn } = getAppContext();
	// viewing multiple posts, show a preview
	$: modeList = mode === 'list';
	// viewing a single post, show everything
	$: modeShow = mode === 'show';

	let showPost = false,
		votePending = false,
		savePending = false;

	$: probablyImage = hasImageExtension(postView.post.url || '');
	$: hasBody = !!postView.post.body;
	$: hasEmbedText = !!postView.post.embed_title;
	$: hasEmbeddableContent = probablyImage || hasBody || hasEmbedText;

	onMount(async () => {
		if (mode === 'show' && loggedIn) {
			await fetch(`/api/posts/${postView.post.id}/read`, {
				method: 'POST'
			});
			dispatch('update-post-view', {
				...postView,
				read: true,
				unread_comments: 0
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

	async function vote(e: CustomEvent<number>) {
		votePending = true;
		const res = await fetch(`/api/posts/${postView.post.id}/vote`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				score: e.detail
			})
		});

		if (res.ok) {
			const pv: PostView = (await res.json()).postView;
			postView.my_vote = pv.my_vote;
			postView.counts.score = pv.counts.score;
			dispatch('update-post-view', pv);
		}
		votePending = false;
	}

	async function save() {
		savePending = true;
		const res = await fetch(`/api/posts/${postView.post.id}/save`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				save: !postView.saved
			})
		});

		if (res.ok) {
			const pv: PostView = (await res.json()).postView;
			postView.saved = pv.saved;
			dispatch('update-post-view', pv);
		}
		savePending = false;
	}
</script>
