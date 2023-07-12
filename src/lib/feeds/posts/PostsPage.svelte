<style lang="scss">
	$sidebarWidth: 30rem;

	aside {
		background-color: var(--sx-gray-800);
		width: #{$sidebarWidth};
		padding: 1rem;
		overflow: auto;
	}
	.sidebar-hidden aside {
		display: none;
	}
	.sidebar-visible .posts-page-content {
		width: calc(100% - #{$sidebarWidth});
	}
	.feed-column {
		overflow: auto;
		max-height: calc(100vh - var(--app-header-height));
		position: relative;
	}
	.feed-column-feed {
		background-color: var(--sx-gray-700);
		flex: 1;
		flex-basis: 300px;
	}
	.feed-column-post {
		border-left: 1px solid var(--sx-gray-transparent-light);
		flex: 2;
	}
	.posts-page-content {
		width: 100%;
	}
</style>

<div
	class="f-1 posts-page f-row"
	class:sidebar-hidden={!$sidebarVisible || feedAdjacentPostView}
	class:sidebar-visible={$sidebarVisible && !feedAdjacentPostView}
>
	<div class="posts-page-content">
		<Stack dir="r" gap={2}>
			<div class="feed-column feed-column-feed virtual-feed-scroll-container">
				{#if communityView}
					<CommunityHeader {communityView} />
				{/if}
				{#if personView}
					<UserHeader {personView} />
				{/if}
				<PostFeed
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
			{#if feedAdjacentPostView && $feedLayout === 'COLUMNS'}
				<div class="feed-column feed-column-post virtual-feed-scroll-container f-column">
					{#key feedAdjacentPostView.post.id}
						<PostPage postView={feedAdjacentPostView} on:update-post-view closeable on:close={closeOverlay} />
					{/key}
				</div>
			{/if}
		</Stack>
	</div>

	{#if !feedAdjacentPostView || $feedLayout !== 'COLUMNS'}
		<aside>
			<slot name="sidebar" />
			{#if communityView && moderators}
				<CommunitySidebar {communityView} {moderators} community={communityView.community} />

				<hr class="my-8" />
			{/if}
			<InstanceSidebar />
		</aside>
	{/if}
</div>

{#if feedAdjacentPostView && $feedLayout === 'OVERLAY'}
	<OverlayPost postView={feedAdjacentPostView} on:close={closeOverlay} on:update-post-view />
{/if}

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import PostFeed from '$lib/feeds/posts/PostFeed.svelte';
	import InstanceSidebar from '$lib/instance/InstanceSidebar.svelte';
	import OverlayPost from '$lib/OverlayPost.svelte';
	import type { CommunityModeratorView, CommunityView, PersonView, PostView } from 'lemmy-js-client';
	import CommunitySidebar from '$lib/CommunitySidebar.svelte';
	import CommunityHeader from './CommunityHeader.svelte';
	import UserHeader from './UserHeader.svelte';
	import type { FeedType } from '$lib/feed-filters';
	import { getAppContext } from '$lib/app-context';
	import type { ContentView } from '$lib/post-loader';
	import { getSettingsContext } from '$lib/settings-context';
	import PostPage from '$lib/PostPage.svelte';
	import { afterNavigate } from '$app/navigation';

	export let feedType: FeedType;
	export let contentViews: ContentView[];
	export let loadingContent: boolean;
	export let loadingContentFailed: boolean;
	export let communityView: CommunityView | null = null;
	export let moderators: CommunityModeratorView[] | null = null;
	export let personView: PersonView | null = null;
	export let endOfFeed: boolean;
	export let selectedType: string; // default  'posts';
	export let selectedListing: string; // default 'local';
	export let selectedSort: string; // default 'Hot';

	const { username } = getAppContext();
	const { sidebarVisible, feedLayout } = getSettingsContext();

	$: isMyFeed = personView ? personView.person.local && personView.person.name === username : false;

	let feedAdjacentPostView: null | PostView;

	async function onOverlay(e: CustomEvent<number>) {
		feedAdjacentPostView = contentViews.reduce((found, p) => {
			const post = p.type === 'post' && p.postView.post.id === e.detail ? p.postView : null;
			return found ? found : post;
		}, null as PostView | null);
	}

	function closeOverlay() {
		feedAdjacentPostView = null;
	}

	afterNavigate(() => {
		closeOverlay();
	});
</script>
