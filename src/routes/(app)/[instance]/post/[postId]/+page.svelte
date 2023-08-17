{#if data.postView}
	<Title title={data.postView.post.name} />
	<ContentViewProvider store={cvStore}>
		{@const content = $cvStore.at(0)}
		{#if content?.type === 'post'}
			{#key content.id}
				<PostPage postView={content.view} crossPosts={data.crossPosts} centered />
			{/key}
		{/if}
	</ContentViewProvider>
{:else}
	<Title title="Not Found" />
	<p>Post not found!</p>
{/if}

<script lang="ts">
	import PostPage from '$lib/PostPage.svelte';
	import Title from '$lib/Title.svelte';
	import { createContentViewStore, postViewToContentView } from '$lib/content-views.js';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';

	export let data;

	const cvStore = createContentViewStore();
	$: if (data.postView) {
		cvStore.set([postViewToContentView(data.postView)]);
	}
</script>
