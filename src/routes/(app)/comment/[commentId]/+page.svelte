{#if data.postView}
	<Title title={`Comment on "${data.postView.post.name}"`} />
	<PostPage postView={data.postView} initialCommentViews={data.commentViews} rootCommentId={data.commentId} />
{:else}
	<Title title="Not Found" />
	<p>Post not found!</p>
{/if}

<script lang="ts">
	import PostPage from '$lib/PostPage.svelte';
	import Title from '$lib/Title.svelte';

	export let data;
</script>
