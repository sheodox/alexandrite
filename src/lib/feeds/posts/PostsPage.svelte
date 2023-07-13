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
		height: calc(100vh - var(--app-header-height));
		position: relative;
	}
	.feed-column-feed {
		background-color: var(--sx-gray-700);
		flex: 1;
		flex-basis: 300px;
	}
	.feed-column-post {
		border-left: 1px solid var(--sx-gray-transparent-light);
		flex: 3;
	}
	.posts-page-content {
		width: 100%;
	}
</style>

<div
	class="posts-page f-row"
	class:sidebar-hidden={!$sidebarVisible || feedAdjacentPostView}
	class:sidebar-visible={$sidebarVisible && !feedAdjacentPostView}
>
	<div class="posts-page-content">
		<Stack dir="r" gap={2}>
			<div class="feed-column feed-column-feed virtual-feed-scroll-container">
				{#if communityView}
					<CommunityHeader {communityView} on:update-community />
				{/if}
				{#if personView}
					<UserHeader {personView} />
				{/if}
				<PostFeed
					{feedType}
					{contentViews}
					on:more
					on:update-post-view
					on:block-community
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
		<aside class="feed-column">
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
	import { afterNavigate } from '$app/navigation';
	import { derived } from 'svelte/store';
	import { Stack } from 'sheodox-ui';
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
	import { getSettingsContext, type FeedLayout } from '$lib/settings-context';
	import PostPage from '$lib/PostPage.svelte';

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

	const { username, screenDimensions } = getAppContext();
	const { sidebarVisible, feedLayout: feedLayoutSetting } = getSettingsContext();

	const feedLayout = derived(
		[feedLayoutSetting, screenDimensions, sidebarVisible],
		([layout, dims, sidebarVisible]): FeedLayout => {
			// non-auto layouts should use their desired layout regardless
			if (layout !== 'AUTO') {
				return layout;
			}

			// AUTO layouts should choose one based on the viewport width.
			// just comparing against some rough estimates of what "looks good"
			let columnDesiredWidth = 1600 + (sidebarVisible ? 500 : 0);

			if (dims.width > columnDesiredWidth) {
				return 'COLUMNS';
			}
			return 'OVERLAY';
		}
	);

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
