<style lang="scss">
	aside {
		background-color: var(--sx-gray-800);
		width: 30rem;
		padding: 1rem;
		overflow: auto;

		> article {
			position: sticky;
			top: 0;
		}
	}
	.community-avatar :global(img) {
		height: 6rem;
		width: 6rem;
		border-radius: 100rem;
		border: 3px solid var(--sx-gray-200);
	}
	.community-header {
		background: var(--sx-gray-800);
	}
</style>

<div class="f-row f-1">
	<div class="f-1">
		{#if communityView}
			<section class="p-8 community-header">
				<Stack gap={2} dir="c">
					<Stack dir="r" gap={6} align="center">
						{#if communityView.community.icon}
							<div class="community-avatar">
								<Image src={communityView.community.icon} />
							</div>
						{/if}
						<h1>!{nameAtInstance(communityView.community)}</h1>
					</Stack>
				</Stack>
			</section>
		{/if}
		<PostFeed {postViews} on:more on:overlay={onOverlay} />
	</div>

	<aside>
		{#if communityView}
			<article>
				<Sidebar counts={communityCounts} description={communityView.community.description ?? ''}>
					<span slot="name"
						>!{communityView.community.name}
						<br />
						<div>
							<span class="muted">@{nameAtInstance(communityView.community, true)}</span>
							<ExternalLink href={communityView.community.actor_id}>
								<Icon icon="arrow-up-right-from-square" />
							</ExternalLink>
						</div>
					</span></Sidebar
				>
			</article>

			<hr class="my-8" />
		{/if}
		<article>
			<InstanceSidebar {siteView} />
		</article>
	</aside>
</div>

{#if overlayPost}
	<OverlayPost postView={overlayPost} on:close={closeOverlay} />
{/if}

<script lang="ts">
	import { Stack, Icon, ExternalLink } from 'sheodox-ui';
	import PostFeed from '$lib/feeds/posts/PostFeed.svelte';
	import InstanceSidebar from '$lib/instance/InstanceSidebar.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import OverlayPost from '$lib/OverlayPost.svelte';
	import Sidebar from '$lib/Sidebar.svelte';
	import Image from '$lib/Image.svelte';
	import type { CommunityView, PostView, SiteView } from 'lemmy-js-client';

	export let postViews: PostView[];
	export let siteView: SiteView;
	export let communityView: CommunityView | null = null;

	$: communityCounts = communityView?.counts
		? [
				{
					label: 'Users',
					icon: 'users',
					value: communityView.counts.subscribers
				},
				{
					label: 'Posts',
					icon: 'file-lines',
					value: communityView.counts.posts
				},
				{
					label: 'Comments',
					icon: 'comments',
					value: communityView.counts.comments
				}
		  ]
		: [];
	console.log({ communityView });

	let overlayPost: null | PostView;

	async function onOverlay(e: CustomEvent<number>) {
		overlayPost = postViews.find((p) => p.post.id === e.detail) ?? null;
	}

	function closeOverlay() {
		overlayPost = null;
	}
</script>
