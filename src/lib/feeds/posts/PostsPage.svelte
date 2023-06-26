<style lang="scss">
	aside {
		background-color: var(--sx-gray-800);
		width: 30rem;
		padding: 1rem;
		overflow: auto;
	}
</style>

<div class="f-row f-1">
	<div class="f-1">
		{#if communityView}
			<CommunityHeader {communityView} />
		{/if}
		{#if personView}
			<UserHeader {personView} />
		{/if}
		<PostFeed
			{settings}
			{feedType}
			{postViews}
			on:more
			on:overlay={onOverlay}
			{endOfFeed}
			{selectedSort}
			{selectedListing}
			{selectedType}
			{loadingPosts}
			{loadingPostsFailed}
		/>
	</div>

	<aside>
		<slot name="sidebar" />
		{#if communityView}
			<CommunitySidebar counts={communityView.counts} community={communityView.community} />

			<hr class="my-8" />
		{/if}
		<InstanceSidebar {siteView} />
	</aside>
</div>

{#if overlayPost}
	<OverlayPost postView={overlayPost} on:close={closeOverlay} />
{/if}

<script lang="ts">
	import PostFeed from '$lib/feeds/posts/PostFeed.svelte';
	import InstanceSidebar from '$lib/instance/InstanceSidebar.svelte';
	import OverlayPost from '$lib/OverlayPost.svelte';
	import type { CommunityView, PersonView, PostView, SiteView } from 'lemmy-js-client';
	import CommunitySidebar from '$lib/CommunitySidebar.svelte';
	import CommunityHeader from './CommunityHeader.svelte';
	import UserHeader from './UserHeader.svelte';
	import type { FeedType } from '$lib/feed-filters';
	import type { Settings } from '../../../app';

	export let feedType: FeedType;
	export let settings: Settings;
	export let postViews: PostView[];
	export let loadingPosts: boolean;
	export let loadingPostsFailed: boolean;
	export let siteView: SiteView;
	export let communityView: CommunityView | null = null;
	export let personView: PersonView | null = null;
	export let endOfFeed: boolean;
	export let selectedType: string; // default  'posts';
	export let selectedListing: string; // default 'local';
	export let selectedSort: string; // default 'Hot';

	console.log({ communityView });

	let overlayPost: null | PostView;

	async function onOverlay(e: CustomEvent<number>) {
		overlayPost = postViews.find((p) => p.post.id === e.detail) ?? null;
	}

	function closeOverlay() {
		overlayPost = null;
	}
</script>
