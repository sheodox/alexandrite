<style>
	.icon :global(img) {
		height: 2rem;
		width: 2rem;
		border-radius: 10rem;
	}
	.icon {
		flex-shrink: 0;
	}
	.description {
		max-height: 20rem;
		overflow: auto;
	}
</style>

<div class="card">
	<Stack dir="r" align="center" cl="card-title" gap={2}>
		{#if communityView.community.icon}
			<div class="icon">
				<Image src={communityView.community.icon} mode="thumbnail" />
			</div>
		{/if}
		<a href="/c/{communityName}" class="inline-link">
			<NameAtInstance place={displayCommunity} prefix="" />
		</a>
	</Stack>

	<Stack cl="card-body" dir="c" gap={2}>
		<CommunityBadges extended community={communityView.community} />
		<Stack dir="r" align="center" gap={2}>
			<CommunityJoin {communityView} />
			<CommunityCounts {communityView} />
		</Stack>

		{#if communityView.community.description}
			<div class="description">
				<Markdown md={communityView.community.description} />
			</div>
		{/if}
	</Stack>
</div>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import Image from '$lib/Image.svelte';
	import CommunityBadges from '$lib/feeds/posts/CommunityBadges.svelte';
	import Markdown from '$lib/Markdown.svelte';
	import type { CommunityView } from 'lemmy-js-client';
	import { nameAtInstance } from '$lib/nav-utils';
	import CommunityCounts from '$lib/CommunityCounts.svelte';
	import CommunityJoin from '$lib/CommunityJoin.svelte';

	export let communityView: CommunityView;
	const communityName = nameAtInstance(communityView.community);
	const displayCommunity = {
		name: communityView.community.title ?? communityView.community.name,
		local: communityView.community.local,
		actor_id: communityView.community.actor_id
	};
</script>
