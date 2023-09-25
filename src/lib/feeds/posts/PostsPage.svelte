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
		border-left: 2px solid var(--sx-gray-transparent-light);
		flex: 3;
	}
	.posts-page-content {
		width: 100%;
	}
</style>

<div
	class="posts-page f-row"
	class:sidebar-hidden={!$sidebarVisible || viewingInColumn}
	class:sidebar-visible={$sidebarVisible && !viewingInColumn}
>
	<div class="posts-page-content">
		<Stack dir="r" gap={2}>
			<!-- need to focus because this is the main scrollable area, otherwise it's
			not possible to immediately scroll with keyboard, also want to handle hotkeys for convenience -->
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="feed-column feed-column-feed virtual-feed-scroll-container"
				tabindex={0}
				use:focus
				bind:this={feedColumnEl}
				on:keydown={onFeedKeydown}
			>
				<ContentViewProvider store={cvHeaderStore}>
					{#each $cvHeaderStore as contentView}
						{#if contentView.type === 'community'}
							<CommunityHeader {contentView} />
						{:else if contentView.type === 'person'}
							<UserHeader {contentView} />
						{/if}
					{/each}
				</ContentViewProvider>
				<PostFeed
					{feedType}
					on:more
					on:overlay={onOverlay}
					{endOfFeed}
					{isMyFeed}
					{selectedSort}
					{selectedListing}
					{selectedType}
					{loadingContent}
					{loadingContentFailed}
					bind:viewportTopIndex
					bind:virtualFeedApi
					bind:postLayoutAPIs
				/>
			</div>
			{#if feedAdjacentPostView?.type === 'post' && $feedLayout === 'COLUMNS'}
				<div class="feed-column feed-column-post f-column">
					{#key feedAdjacentPostView.id}
						<PostPage postView={feedAdjacentPostView.view} closeable on:close={closeOverlay} />
					{/key}
				</div>
			{/if}
		</Stack>
	</div>

	{#if !feedAdjacentPostView || $feedLayout !== 'COLUMNS'}
		<aside class="feed-column">
			<slot name="sidebar" />
			{#if communityView && moderators}
				<CommunitySidebar communityName={nameAtInstance(communityView.community)} />

				<hr class="my-8" />
			{/if}
			<InstanceSidebar />
		</aside>
	{/if}
</div>

{#if feedAdjacentPostView?.type === 'post' && $feedLayout === 'OVERLAY'}
	<OverlayPost postView={feedAdjacentPostView.view} on:close={closeOverlay} />
{/if}

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { derived } from 'svelte/store';
	import { Stack, focus } from 'sheodox-ui';
	import PostFeed from '$lib/feeds/posts/PostFeed.svelte';
	import InstanceSidebar from '$lib/instance/InstanceSidebar.svelte';
	import OverlayPost from '$lib/OverlayPost.svelte';
	import type { CommunityModeratorView, CommunityView, PersonView } from 'lemmy-js-client';
	import CommunitySidebar from '$lib/CommunitySidebar.svelte';
	import CommunityHeader from './CommunityHeader.svelte';
	import UserHeader from './UserHeader.svelte';
	import type { FeedType } from '$lib/feed-filters';
	import { getAppContext } from '$lib/app-context';
	import { getSettingsContext, type FeedLayout } from '$lib/settings-context';
	import PostPage from '$lib/PostPage.svelte';
	import {
		communityViewToContentView,
		createContentViewStore,
		getContentViewStore,
		personViewToContentView,
		type ContentView
	} from '$lib/content-views';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import { profile, instance } from '$lib/profiles/profiles';
	import type { VirtualFeedAPI } from '$lib/virtual-feed';
	import { isElementEditable, isInteractiveElementBetween } from '$lib/utils';
	import type { PostLayoutAPI } from './post-utils';
	import { nameAtInstance } from '$lib/nav-utils';

	export let feedType: FeedType;
	export let loadingContent: boolean;
	export let loadingContentFailed: boolean;
	export let communityView: CommunityView | null = null;
	export let moderators: CommunityModeratorView[] | null = null;
	export let personView: PersonView | null = null;
	export let endOfFeed: boolean;
	export let selectedType: string; // default  'posts';
	export let selectedListing: string; // default 'local';
	export let selectedSort: string; // default 'Hot';
	// the URL of the page we're on, to go back to when closing feed adjacent posts
	export let pageBaseUrl: string;

	const { screenDimensions, navSidebarOpen } = getAppContext();
	const { sidebarVisible, feedLayout: feedLayoutSetting, navSidebarDocked } = getSettingsContext();

	const cvStore = getContentViewStore();

	const cvHeaderStore = createContentViewStore();
	cvHeaderStore.clear();
	const cvs: ContentView[] = [];

	let feedColumnEl: HTMLElement;
	// PostFeed's VirtualFeed api and viewport top, needed to handle hotkeys
	let viewportTopIndex: number, virtualFeedApi: VirtualFeedAPI;
	let postLayoutAPIs: PostLayoutAPI[] = [];

	function onFeedKeydown(e: KeyboardEvent) {
		if (isElementEditable(e.target as HTMLElement)) {
			return;
		}

		const viewportTopPostAPI = postLayoutAPIs[viewportTopIndex];
		const key = e.key.toLowerCase();

		if (key === 'j') {
			virtualFeedApi.scrollToIndex(viewportTopIndex + 1);
		} else if (key === 'k') {
			virtualFeedApi.scrollToIndex(viewportTopIndex - 1);
		} else if (key === 'enter' && !isInteractiveElementBetween(feedColumnEl, e.target as HTMLElement)) {
			const post = $cvStore[viewportTopIndex];
			if (post?.type === 'post') {
				openPostAdjacent(post.id);
			}
		} else if (key === 'a' && viewportTopPostAPI) {
			viewportTopPostAPI.upvote();
		} else if (key === 'z' && viewportTopPostAPI) {
			viewportTopPostAPI.downvote();
		} else if (key === 's' && viewportTopPostAPI) {
			viewportTopPostAPI.save();
		}
	}

	$: viewingInColumn = !!feedAdjacentPostView && $feedLayout === 'COLUMNS';

	if (communityView) {
		cvs.push(communityViewToContentView(communityView));
	}
	if (personView) {
		cvs.push(personViewToContentView(personView));
	}

	cvHeaderStore.set(cvs);

	const feedLayout = derived(
		[feedLayoutSetting, screenDimensions, sidebarVisible],
		([layout, dims, sidebarVisible]): FeedLayout => {
			// non-auto layouts should use their desired layout regardless
			if (layout !== 'AUTO') {
				return layout;
			}

			// AUTO layouts should choose one based on the viewport width.
			// just comparing against some rough estimates of what "looks good"
			let columnDesiredWidth = 1600 + (sidebarVisible ? 500 : 0) + ($navSidebarDocked && $navSidebarOpen ? 350 : 0);

			if (dims.width > columnDesiredWidth) {
				return 'COLUMNS';
			}
			return 'OVERLAY';
		}
	);

	$: isMyFeed = personView ? personView.person.local && personView.person.name === $profile.username : false;

	let feedAdjacentPostViewId: null | number = null;
	$: feedAdjacentPostView = $cvStore.find((cv) => cv.id === feedAdjacentPostViewId);

	async function openPostAdjacent(postId: number) {
		feedAdjacentPostViewId = postId;
		history.pushState(null, '', `/${$instance}/post/${postId}`);
	}

	async function onOverlay(e: CustomEvent<number>) {
		openPostAdjacent(e.detail);
	}

	function closeOverlay() {
		feedAdjacentPostViewId = null;
		history.pushState(null, '', pageBaseUrl);
		feedColumnEl.focus();
	}

	afterNavigate(() => {
		if (feedAdjacentPostViewId !== null) {
			closeOverlay();
		}
	});
</script>
