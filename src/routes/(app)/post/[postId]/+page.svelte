{#if data.postView}
	<PostPage postView={data.postView} />
{:else}
	<p>Post not found!</p>
{/if}

<script>
	import { Layout } from 'sheodox-ui';
	import PostPage from '$lib/PostPage.svelte';
	export let data;
</script>
