{#if data.postView}
	<Title title={data.postView.post.name} />
	<ContentViewProvider store={cvStore}>
		<PostPage postView={data.postView} centered />
	</ContentViewProvider>
{:else}
	<Title title="Not Found" />
	<p>Post not found!</p>
{/if}

<script lang="ts">
	import PostPage from '$lib/PostPage.svelte';
	import Title from '$lib/Title.svelte';
	import { createContentViewStore } from '$lib/content-views.js';
	import ContentViewProvider from '$lib/ContentViewProvider.svelte';

	export let data;

	const cvStore = createContentViewStore();
</script>
