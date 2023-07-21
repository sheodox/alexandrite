<Title />

<ContentViewProvider store={cvStore}>
	<PostsPage
		on:more={more}
		{endOfFeed}
		feedType="top"
		selectedType={data.query.type}
		selectedListing={data.query.listing}
		selectedSort={data.query.sort}
		{loadingContent}
		{loadingContentFailed}
	/>
</ContentViewProvider>

<script lang="ts">
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import { postCommentFeedLoader } from '$lib/post-loader.js';
	import type { PageData } from './$types';
	import Title from '$lib/Title.svelte';
	import { loadFeedData } from '$lib/feed-query';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import { createContentViewStore } from '$lib/content-views';

	export let data;

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false;

	const cvStore = createContentViewStore();

	let loader: ReturnType<typeof initFeed>;
	$: {
		loader = initFeed(data);
		cvStore.clear();
		// load the first page of data
		more();
	}

	function initFeed(data: PageData) {
		const newLoader = postCommentFeedLoader({
			type: data.query.type,
			queryFn: async (page: number) => {
				return await loadFeedData({
					page,
					listing: data.query.listing,
					sort: data.query.sort,
					type: data.query.type
				});
			}
		});

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;

		return newLoader;
	}

	async function more() {
		if (endOfFeed || loadingContent) {
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
