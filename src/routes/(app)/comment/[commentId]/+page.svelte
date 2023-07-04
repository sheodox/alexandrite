{#if data.postView}
	<Title title={`Comment on "${data.postView.post.name}"`} />
	<PostPage postView={data.postView} commentViews={data.commentViews} rootCommentId={data.commentId} />
{:else}
	<Title title="Not Found" />
	<p>Post not found!</p>
{/if}

<script>
	import PostPage from '$lib/PostPage.svelte';
	import Title from '$lib/Title.svelte';

	export let data;
</script>
