<Title title={nameAtInstance(data.communityView.community, data.communityView.community.title)} />
{#key data}
	<ContentViewProvider store={cvStore}>
		<PostsPage
			on:more={more}
			feedType="community"
			communityView={data.communityView}
			moderators={data.moderators}
			{endOfFeed}
			selectedType={data.query.type}
			selectedListing={data.query.listing}
			selectedSort={data.query.sort}
			{loadingContent}
			{loadingContentFailed}
		/>
	</ContentViewProvider>
{/key}

<script lang="ts">
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import { postCommentFeedLoader } from '$lib/post-loader.js';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import type { PageData } from './$types';
	import Title from '$lib/Title.svelte';
	import { loadFeedData } from '$lib/feed-query';
	import { createContentViewStore } from '$lib/content-views';
	import { nameAtInstance } from '$lib/nav-utils';

	export let data;

	const cvStore = createContentViewStore();

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false;

	let loader: ReturnType<typeof initFeed>;
	$: {
		loader = initFeed(data);
		cvStore.clear();
		more();
	}

	function initFeed(data: PageData) {
		if (data.communityView.blocked) {
			endOfFeed = true;
			return;
		}
		const newLoader = postCommentFeedLoader({
			type: data.query.type,
			queryFn: async (page: number) => {
				return await loadFeedData({
					page,
					listing: data.query.listing,
					sort: data.query.sort,
					type: data.query.type,
					communityName: data.communityName
				});
			}
		});

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;

		return newLoader;
	}

	async function more() {
		if (endOfFeed || loadingContent || !loader) {
			return;
		}
		loadingContent = true;

		const qs = location.search;
		const feedData = (await loader.next()).value;
		if (qs === location.search) {
			loadingContentFailed = feedData.error;
			endOfFeed = feedData.endOfFeed;
			cvStore.append(feedData.contentViews);

			loadingContent = false;
		}
	}
</script>
