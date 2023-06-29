<PostsPage
	settings={data.settings}
	on:more={more}
	feedType="community"
	{contentViews}
	siteView={data.site.site_view}
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
	import { postCommentFeedLoader, getContentViews, type ContentView } from '$lib/post-loader.js';
	import type { PageData } from '../../$types.js';

	export let data;

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false,
		contentViews: ContentView[] = [];
	$: loader = initFeed(data);

	function initFeed(data: PageData) {
		const newLoader = postCommentFeedLoader({
			queryUrlBase: `/api/feed?listing=${data.query.listing}&sort=${data.query.sort}&communityName=${data.communityName}`,
			type: data.query.type,
			postViews: data.postViews,
			commentViews: data.commentViews
		});

		loadingContent = false;
		loadingContentFailed = false;
		endOfFeed = false;
		contentViews = getContentViews(data.postViews, data.commentViews);

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
