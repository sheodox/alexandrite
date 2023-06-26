<PostsPage
	on:more={more}
	postViews={data.posts}
	siteView={data.site.site_view}
	communityView={data.communityView}
	{endOfFeed}
	selectedType={data.query.type}
	selectedListing={data.query.listing}
	selectedSort={data.query.sort}
/>

<script lang="ts">
	import type { PostView } from 'lemmy-js-client';
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';

	export let data;
	let page = 1,
		endOfFeed = false;

	async function more() {
		const nextPage: { posts: PostView[] } = await fetch(
			`/api/posts?page=${++page}&communityName=${data.communityName}`
		).then((res) => res.json());

		if (!nextPage.posts) {
			endOfFeed = true;
			return;
		}
		data.posts = [...data.posts, ...nextPage.posts.filter((p) => !data.posts.some((p2) => p2.post.id === p.post.id))];
	}
</script>
