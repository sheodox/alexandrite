<style lang="scss">
	aside {
		background-color: var(--sx-gray-800);
		width: 30rem;
		padding: 1rem;
		overflow: auto;

		> article {
			position: sticky;
			top: 0;
		}
	}
</style>

<div class="f-row f-1">
	<div class="f-1 px-6 py-2">
		<PostFeed postViews={data.posts} on:more={more} on:overlay={onOverlay} />
	</div>

	<aside>
		<article>
			<InstanceSidebar siteView={data.site.site_view} />
		</article>
	</aside>
</div>

{#if overlayPost}
	<OverlayPost postView={overlayPost} on:close={closeOverlay} />
{/if}

<script lang="ts">
	import PostFeed from '$lib/feeds/posts/PostFeed.svelte';
	import InstanceSidebar from '$lib/instance/InstanceSidebar.svelte';
	import type { PostView } from 'lemmy-js-client';
	import OverlayPost from './OverlayPost.svelte';

	export let data;
	let page = 1;
	let overlayPost: null | PostView;

	console.log('data', data);

	async function more() {
		const nextPage: { posts: PostView[] } = await fetch(`/api/posts?page=${++page}`).then((res) => res.json());
		data.posts = [...data.posts, ...nextPage.posts.filter((p) => !data.posts.some((p2) => p2.post.id === p.post.id))];
	}

	async function onOverlay(e: CustomEvent<number>) {
		overlayPost = data.posts.find((p) => p.post.id === e.detail) ?? null;
	}

	function closeOverlay() {
		overlayPost = null;
	}
</script>
