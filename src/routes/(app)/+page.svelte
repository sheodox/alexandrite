<PostsPage
	on:more={more}
	{endOfFeed}
	postViews={data.posts}
	siteView={data.site.site_view}
	selectedType={data.query.type}
	selectedListing={data.query.listing}
	selectedSort={data.query.sort}
	settings={data.settings}
	showListingFilter
/>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';

	export let data;
	let page = 1,
		endOfFeed = false;

	async function more() {
		if (endOfFeed) {
			return;
		}
		const nextPage: { posts: PostView[] } = await fetch(
			`/api/posts?page=${++page}&type=${data.query.type}&listing=${data.query.listing}&sort=${data.query.sort}`
		).then((res) => res.json());
		if (!nextPage.posts) {
			endOfFeed = true;
			return;
		}

		data.posts = [...data.posts, ...nextPage.posts.filter((p) => !data.posts.some((p2) => p2.post.id === p.post.id))];
	}
</script>
