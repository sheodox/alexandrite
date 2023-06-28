<style>
	.community-avatar :global(img) {
		height: 1.6rem;
		width: 1.6rem;
		border-radius: 10rem;
	}
</style>

<a href="/c/{communityName}" class:inline-link={inlineLink} data-sveltekit-preload-data="off">
	{#if inlineLink}
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
				<NameAtInstance place={displayCommunity} prefix="" />
				<CommunityBadges {community} />
			</span>
		</Tooltip>
	{:else}
		<Stack gap={2} dir="r" align="center" cl="icon-link">
			<div class="community-avatar">
				{#if community.icon}
					<Image src={community.icon} />
				{:else}
					<Icon icon="users" variant="icon-only" />
				{/if}
			</div>
			<span>
				{displayCommunity.name}
			</span>
		</Stack>
	{/if}
</a>

<script lang="ts">
	import { Stack, Icon, Tooltip } from 'sheodox-ui';
	import Image from './Image.svelte';
	import { nameAtInstance } from './nav-utils';
	import CommunityBadges from './feeds/posts/CommunityBadges.svelte';
	import type { Community } from 'lemmy-js-client';
	import NameAtInstance from './NameAtInstance.svelte';

	export let community: Community;
	export let inlineLink = true;

	const communityName = nameAtInstance(community);
	const displayCommunity = {
		name: community.title ?? community.name,
		local: community.local,
		actor_id: community.actor_id
	};
</script>
