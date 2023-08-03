{#if data.postView}
	<Title title={`Comment on "${data.postView.post.name}"`} />
	{#key data.commentViews}
		<ContentViewProvider store={cvStore}>
			{@const content = $cvStore.at(0)}
			{#if content?.type === 'post'}
				<PostPage
					postView={content.view}
					initialCommentViews={data.commentViews}
					rootCommentId={data.commentId}
					centered
				/>
			{/if}
		</ContentViewProvider>
	{/key}
{:else}
	<Title title="Not Found" />
	<p>Post not found!</p>
{/if}

<script lang="ts">
	import PostPage from '$lib/PostPage.svelte';
	import Title from '$lib/Title.svelte';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';
	import { createContentViewStore, postViewToContentView } from '$lib/content-views.js';

	export let data;

	const cvStore = createContentViewStore();
	cvStore.set([postViewToContentView(data.postView)]);
</script>
