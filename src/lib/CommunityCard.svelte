<style>
	.icon :global(img) {
		height: 2.4rem;
		width: 2.4rem;
		border-radius: 10rem;
		overflow: hidden;
		border: 3px solid var(--sx-gray-200);
		object-fit: cover;
	}
	.icon {
		flex-shrink: 0;
	}
	.description {
		max-height: 20rem;
		overflow: auto;
	}
</style>

<div class="p-2">
	<div class="card p-4">
		<Stack dir="r" align="center" cl="card-title" gap={2}>
			{#if communityView.community.icon}
				<div class="icon">
					<Image src={communityView.community.icon} mode="thumbnail" />
				</div>
			{/if}
			<a href="/{$profile.instance}/c/{communityName}" class="inline-link">
				<NameAtInstance place={displayCommunity} prefix="" />
			</a>
		</Stack>

		<Stack cl="card-body" dir="c" gap={2}>
			{@const communityAddress = '!' + nameAtInstance(communityView.community, '', { alwaysShowInstance: true })}
			<CopyableText text={communityAddress} />
			<CommunityBadges extended community={communityView.community} />
			<Stack dir="r" align="center" gap={2}>
				<CommunityJoin {communityView} />
				<CommunityCounts {communityView} />
			</Stack>

			{#if communityView.community.description}
				<div class="description">
					<Markdown md={communityView.community.description} noImages />
				</div>
			{/if}
		</Stack>
	</div>
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
	import { profile } from '$lib/profiles/profiles';
	import CopyableText from './CopyableText.svelte';

	export let communityView: CommunityView;
	$: communityName = nameAtInstance(communityView.community);
	$: displayCommunity = {
		name: communityView.community.title ?? communityView.community.name,
		local: communityView.community.local,
		actor_id: communityView.community.actor_id
	};
</script>
