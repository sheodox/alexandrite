<PostsPage
	settings={data.settings}
	on:more={more}
	{endOfFeed}
	feedType="top"
	postViews={data.posts}
	siteView={data.site.site_view}
	selectedType={data.query.type}
	selectedListing={data.query.listing}
	selectedSort={data.query.sort}
	{loadingPosts}
	{loadingPostsFailed}
/>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';
	import { postLoader } from '$lib/post-loader.js';

	export let data;
	const loader = postLoader<PostView>(
		`/api/posts?type=${data.query.type}&listing=${data.query.listing}&sort=${data.query.sort}`,
		'posts'
	);
	let loadingPosts = false,
		loadingPostsFailed = false,
		endOfFeed = false;

	async function more() {
		if (endOfFeed || loadingPosts) {
			return;
		}
		loadingPosts = true;

		const more = (await loader.next()).value;
		loadingPostsFailed = more.error;
		endOfFeed = more.endOfFeed;

		data.posts = [...data.posts, ...more.items.filter((p) => !data.posts.some((p2) => p2.post.id === p.post.id))];

		loadingPosts = false;
	}
</script>
