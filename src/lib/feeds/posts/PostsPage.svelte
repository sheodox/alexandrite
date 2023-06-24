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
</style>

<div class="f-row f-1">
	<div class="f-1 px-6 py-2">
		{#if communityView}
			<section class="p-8">
				<Stack gap={2} dir="c">
					<h1>!{nameAtInstance(communityView.community)}</h1>
					<div />
				</Stack>
			</section>
		{/if}
		<PostFeed {postViews} on:more on:overlay={onOverlay} />
	</div>

	<aside>
		{#if communityView}
			<article>
				<Sidebar description={communityView.community.description ?? ''}>
					<span slot="name"
						>!{communityView.community.name}<span class="muted">@{nameAtInstance(communityView.community, true)}</span>
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
	import { Stack } from 'sheodox-ui';
	import PostFeed from '$lib/feeds/posts/PostFeed.svelte';
	import InstanceSidebar from '$lib/instance/InstanceSidebar.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import OverlayPost from '$lib/OverlayPost.svelte';
	import Sidebar from '$lib/Sidebar.svelte';
	import type { CommunityView, PostView, SiteView } from 'lemmy-js-client';

	export let postViews: PostView[];
	export let siteView: SiteView;
	export let communityView: CommunityView | null = null;

	console.log({ communityView });

	let overlayPost: null | PostView;

	async function onOverlay(e: CustomEvent<number>) {
		overlayPost = postViews.find((p) => p.post.id === e.detail) ?? null;
	}

	function closeOverlay() {
		overlayPost = null;
	}
</script>
