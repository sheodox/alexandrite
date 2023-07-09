{#if data.postView}
	<Title title={data.postView.post.name} />
	<Layout size="wide">
		<PostPage postView={data.postView} />
	</Layout>
{:else}
	<Title title="Not Found" />
	<p>Post not found!</p>
{/if}

<script lang="ts">
	import { Layout } from 'sheodox-ui';
	import PostPage from '$lib/PostPage.svelte';
	import Title from '$lib/Title.svelte';

	export let data;
</script>
