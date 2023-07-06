<Title title={userUsername} />

<PostsPage
	settings={data.settings}
	on:more={more}
	on:update-post-view={updatePostView}
	feedType="user"
	contentViews={filterContentType(contentViews, data.query.type)}
	siteView={data.site.site_view}
	personView={data.personView}
	{endOfFeed}
	selectedType={data.query.type}
	selectedListing={data.query.listing}
	selectedSort={data.query.sort}
	{loadingContent}
	{loadingContentFailed}
>
	<div slot="sidebar">
		<article>
			<h1>Stats</h1>
			<UserCounts personView={data.personView} />
		</article>
		{#if data.moderates && data.moderates.length}
			<article>
				<h1>Moderates</h1>
				{#each data.moderates as mod}
					<div />
					<CommunityLink community={mod.community} />
				{/each}
			</article>
			<hr class="my-8" />
		{/if}
	</div>
</PostsPage>

<script lang="ts">
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import UserCounts from '$lib/UserCounts.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import { userFeedLoader, type ContentView, getContentViews } from '$lib/post-loader.js';
	import { nameAtInstance } from '$lib/nav-utils.js';
	import type { PostView } from 'lemmy-js-client';
	import Title from '$lib/Title.svelte';

	export let data;

	const userUsername = nameAtInstance(data.personView.person),
		loader = userFeedLoader({
			postViews: data.postViews,
			commentViews: data.commentViews,
			queryUrlBase: `/api/feed?username=${userUsername}&type=${data.query.type}&listing=${data.query.listing}&sort=${data.query.sort}`,
			sort: data.query.sort,
			type: data.query.type
		});

	let contentViews = getContentViews(data.postViews, data.commentViews, data.query.type, data.query.sort);

	let loadingContent = false,
		loadingContentFailed = false,
		endOfFeed = false;

	function filterContentType(cv: ContentView[], type: string) {
		// overview shows both types
		if (type === 'Overview') {
			return cv;
		} else if (type === 'Comments') {
			return cv.filter((content) => content.type === 'comment');
		} else {
			// post and saved only shows posts
			return cv.filter((content) => content.type === 'post');
		}
	}

	async function more() {
		if (endOfFeed || loadingContent) {
			return;
		}
		loadingContent = true;

		const more = (await loader.next()).value;
		loadingContentFailed = more.error;
		contentViews = contentViews.concat(more.contentViews);
		endOfFeed = more.endOfFeed;

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
