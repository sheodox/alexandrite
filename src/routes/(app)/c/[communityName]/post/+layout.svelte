<style>
	.community-header {
		border-radius: 20px;
		overflow: hidden;
	}
</style>

<Title title="Post" />

<Layout size="medium">
	<div class="community-header my-2">
		<CommunityHeader communityView={data.communityView} readonly />
	</div>

	<slot />
</Layout>

<script>
	import CommunityHeader from '$lib/feeds/posts/CommunityHeader.svelte';
	import { Layout } from 'sheodox-ui';
	import Title from '$lib/Title.svelte';

	export let data;
</script>
