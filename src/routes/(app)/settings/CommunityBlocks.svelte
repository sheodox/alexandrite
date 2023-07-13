<style>
	.blocks {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		justify-content: center;
	}
</style>

<h2 class="mb-0">Blocked Communities</h2>
<div class="blocks gap-2">
	{#each blocks as community}
		<CommunityBlock {community} on:unblock />
	{/each}
</div>

<script lang="ts">
	import type { Community } from 'lemmy-js-client';
	import CommunityBlock from './CommunityBlock.svelte';

	export let blocks: Community[];
</script>
