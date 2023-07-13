<Title title={userUsername} />

<PostsPage
	on:more={more}
	on:update-post-view={updatePostView}
	on:block-community={onBlockCommunity}
	feedType="user"
	contentViews={filterContentType(contentViews, data.query.type)}
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
				<h2 class="mb-0">Moderates</h2>
				<Stack dir="c" gap={2}>
					{#each data.moderates as mod}
						<CommunityLink community={mod.community} />
					{/each}
				</Stack>
			</article>
		{/if}

		<hr class="my-8" />
	</div>
</PostsPage>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import UserCounts from '$lib/UserCounts.svelte';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import { userFeedLoader, type ContentView } from '$lib/post-loader.js';
	import { nameAtInstance } from '$lib/nav-utils.js';
	import type { PostView } from 'lemmy-js-client';
	import Title from '$lib/Title.svelte';
	import { loadFeedData } from '$lib/feed-query.js';
	import type { PageData } from './$types';

	export let data;

	const userUsername = nameAtInstance(data.personView.person);

	let loader: ReturnType<typeof initFeed>;
	$: {
		loader = initFeed(data);
		// load the first page of data
		more();
	}

	function initFeed(data: PageData) {
		return userFeedLoader({
			sort: data.query.sort,
			type: data.query.type,
			queryFn: async (page: number) => {
				return await loadFeedData({
					page,
					listing: data.query.listing,
					sort: data.query.sort,
					username: userUsername
				});
			}
		});
	}

	let contentViews: ContentView[] = [];

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

	function onBlockCommunity(e: CustomEvent<number>) {
		contentViews = contentViews.filter((view) => view.communityId !== e.detail);
	}
</script>
