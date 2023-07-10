<Title title={data.communityName} />
<PostsPage
	on:more={more}
	feedType="community"
	{contentViews}
	communityView={data.communityView}
	moderators={data.moderators}
	{endOfFeed}
	selectedType={data.query.type}
	selectedListing={data.query.listing}
	selectedSort={data.query.sort}
	{loadingContent}
	{loadingContentFailed}
	on:update-post-view={updatePostView}
/>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import { postCommentFeedLoader, type ContentView } from '$lib/post-loader.js';
	import type { PageData } from './$types';
	import Title from '$lib/Title.svelte';
	import { loadFeedData } from '$lib/feed-query';

	export let data;

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false,
		contentViews: ContentView[] = [];

	let loader: ReturnType<typeof initFeed>;
	$: {
		loader = initFeed(data);
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
					type: data.query.type,
					communityName: data.communityName
				});
			}
		});

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;
		contentViews = [];

		return newLoader;
	}

	async function more() {
		if (endOfFeed || loadingContent) {
			return;
		}
		loadingContent = true;

		const feedData = (await loader.next()).value;
		loadingContentFailed = feedData.error;
		endOfFeed = feedData.endOfFeed;
		contentViews = contentViews.concat(feedData.contentViews);

		loadingContent = false;
	}

	function updatePostView(e: CustomEvent<PostView>) {
		const pv = e.detail;
		for (const ct of contentViews) {
			if (ct.type === 'post' && ct.postView.post.id === pv.post.id) {
				ct.postView = pv;
			}
		}
		contentViews = contentViews;
	}
</script>
