<style>
	.community-avatar :global(img) {
		height: 2rem;
		width: 2rem;
		border-radius: 10rem;
	}
</style>

<Tooltip>
	<div slot="tooltip">
		<Stack gap={2} dir="r" align="center">
			{#if community.icon}
				<div class="community-avatar">
					<Image src={community.icon} />
				</div>
			{/if}
			<h1 class="sx-font-size-4 m-0">
				{displayCommunity.name}
			</h1>
		</Stack>
		{#if community.title}
			<NameAtInstance place={community} prefix="!" />
		{/if}
	</div>
	<span>
		<a href="/c/{communityName}" class="inline-link" data-sveltekit-preload-data="off"
			><NameAtInstance place={displayCommunity} prefix="" /></a
		>
		<CommunityBadges {community} />
	</span>
</Tooltip>

<script lang="ts">
	import { Stack, Tooltip } from 'sheodox-ui';
	import Image from './Image.svelte';
	import { nameAtInstance } from './nav-utils';
	import CommunityBadges from './feeds/posts/CommunityBadges.svelte';
	import type { Community } from 'lemmy-js-client';
	import NameAtInstance from './NameAtInstance.svelte';

	export let community: Community;
	const communityName = nameAtInstance(community);
	const displayCommunity = {
		name: community.title ?? community.name,
		local: community.local,
		actor_id: community.actor_id
	};
</script>
