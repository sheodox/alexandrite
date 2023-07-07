<style lang="scss">
	$sidebarWidth: 30rem;

	aside {
		background-color: var(--sx-gray-800);
		width: #{$sidebarWidth};
		padding: 1rem;
		overflow: auto;
		position: fixed;
		top: 0;
		padding-top: 50px;
		height: 100vh;
		right: 0;
	}
	.sidebar-hidden aside {
		display: none;
	}
	.sidebar-visible .posts-page-content {
		width: calc(100% - #{$sidebarWidth});
	}
</style>

<div class="f-1 posts-page" class:sidebar-hidden={!$sidebarVisible} class:sidebar-visible={$sidebarVisible}>
	<div class="posts-page-content">
		{#if communityView}
			<CommunityHeader {communityView} />
		{/if}
		{#if personView}
			<UserHeader {personView} />
		{/if}
		<PostFeed
			{settings}
			{feedType}
			{contentViews}
			on:more
			on:update-post-view
			on:overlay={onOverlay}
			{endOfFeed}
			{isMyFeed}
			{selectedSort}
			{selectedListing}
			{selectedType}
			{loadingContent}
			{loadingContentFailed}
		/>
	</div>

	<aside>
		<slot name="sidebar" />
		{#if communityView && moderators}
			<CommunitySidebar {communityView} {moderators} community={communityView.community} />

			<hr class="my-8" />
		{/if}
		<InstanceSidebar {siteView} />
	</aside>
</div>

{#if overlayPost}
	<OverlayPost postView={overlayPost} on:close={closeOverlay} on:update-post-view />
{/if}

<script lang="ts">
	import PostFeed from '$lib/feeds/posts/PostFeed.svelte';
	import InstanceSidebar from '$lib/instance/InstanceSidebar.svelte';
	import OverlayPost from '$lib/OverlayPost.svelte';
	import type { CommunityModeratorView, CommunityView, PersonView, PostView, SiteView } from 'lemmy-js-client';
	import CommunitySidebar from '$lib/CommunitySidebar.svelte';
	import CommunityHeader from './CommunityHeader.svelte';
	import UserHeader from './UserHeader.svelte';
	import type { FeedType } from '$lib/feed-filters';
	import type { Settings } from '../../../app';
	import { getAppContext } from '$lib/app-context';
	import type { ContentView } from '$lib/post-loader';

	export let feedType: FeedType;
	export let settings: Settings;
	export let contentViews: ContentView[];
	export let loadingContent: boolean;
	export let loadingContentFailed: boolean;
	export let siteView: SiteView;
	export let communityView: CommunityView | null = null;
	export let moderators: CommunityModeratorView[] | null = null;
	export let personView: PersonView | null = null;
	export let endOfFeed: boolean;
	export let selectedType: string; // default  'posts';
	export let selectedListing: string; // default 'local';
	export let selectedSort: string; // default 'Hot';

	const { username, sidebarVisible } = getAppContext();

	$: isMyFeed = personView ? personView.person.local && personView.person.name === username : false;

	let overlayPost: null | PostView;

	async function onOverlay(e: CustomEvent<number>) {
		overlayPost = contentViews.reduce((found, p) => {
			const post = p.type === 'post' && p.postView.post.id === e.detail ? p.postView : null;
			return found ? found : post;
		}, null as PostView | null);
	}

	function closeOverlay() {
		overlayPost = null;
	}
</script>
