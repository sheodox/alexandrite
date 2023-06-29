<PostsPage
	settings={data.settings}
	on:more={more}
	on:update-post-view={updatePostView}
	{endOfFeed}
	feedType="top"
	{contentViews}
	siteView={data.site.site_view}
	selectedType={data.query.type}
	selectedListing={data.query.listing}
	selectedSort={data.query.sort}
	{loadingContent}
	{loadingContentFailed}
/>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import { getContentViews, postCommentFeedLoader } from '$lib/post-loader.js';

	export let data;
	let loader = postCommentFeedLoader({
		queryUrlBase: `/api/feed?listing=${data.query.listing}&sort=${data.query.sort}`,
		type: data.query.type,
		postViews: data.postViews,
		commentViews: data.commentViews
	});

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false,
		contentViews = getContentViews(data.postViews, data.commentViews);

	async function more() {
		if (endOfFeed || loadingContent) {
			return;
		}
		loadingContent = true;

		const feedData = (await loader.next()).value;
		loadingContentFailed = feedData.error;
		endOfFeed = feedData.endOfFeed;
		contentViews = feedData.contentViews;

		loadingContent = false;
	}

	function updatePostView(e: CustomEvent<PostView>) {
		const pv = e.detail;
		for (const ct of contentViews) {
			if (ct.type === 'post' && ct.postView.post.id === pv.post.id) {
				Object.assign(ct.postView, pv);
			}
		}
		contentViews = contentViews;
	}
</script>
