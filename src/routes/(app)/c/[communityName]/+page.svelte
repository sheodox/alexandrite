<PostsPage on:more={more} postViews={data.posts} siteView={data.site.site_view} communityView={data.communityView} />

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import type { PostView } from 'lemmy-js-client';
	import PostsPage from '$lib/feeds/posts/PostsPage.svelte';

	export let data;
	let page = 1;

	async function more() {
		const nextPage: { posts: PostView[] } = await fetch(
			`/api/posts?page=${++page}?communityName=${data.communityName}`
		).then((res) => res.json());
		data.posts = [...data.posts, ...nextPage.posts.filter((p) => !data.posts.some((p2) => p2.post.id === p.post.id))];
	}
</script>
