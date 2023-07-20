<style lang="scss">
	.community-avatar {
		height: 1.6rem;
		width: 1.6rem;
		border-radius: 10rem;

		:global(img) {
			border-radius: 10rem;
			height: 100%;
			width: 100%;
			object-fit: cover;
		}
	}
	.community-avatar {
		&.small {
			height: 1em;
			width: 1em;
		}
		&.medium {
			height: 1.6rem;
			width: 1.6rem;
		}
		&.large {
			height: 3rem;
			width: 3rem;
		}
	}
</style>

<a href="/c/{communityName}" class:inline-link={inlineLink} data-sveltekit-preload-data="off">
	{#if inlineLink}
		<Tooltip>
			<div slot="tooltip" class="community-tooltip">
				<Stack gap={2} dir="r" align="center">
					{#if community.icon && ls.show_avatars}
						<div class="community-avatar large">
							<Image src={community.icon} mode="thumbnail" />
						</div>
					{/if}
					<h1 class="sx-font-size-4 m-0">
						{community.title || community.name}
					</h1>
				</Stack>
				{#if community.title}
					<NameAtInstance place={community} prefix="!" />
				{/if}
			</div>
			<span class="f-row gap-1">
				{#if community.icon && ls.show_avatars}
					<div class="community-avatar small">
						<Image src={community.icon} mode="thumbnail" thumbnailResolution={16} />
					</div>
				{/if}
				<EllipsisText><NameAtInstance place={community} displayName={community.title} prefix="" /></EllipsisText>
				<CommunityBadges {community} />
			</span>
		</Tooltip>
	{:else}
		<Stack gap={2} dir="r" align="center" cl="icon-link">
			<div class="community-avatar medium">
				{#if community.icon && ls.show_avatars}
					<Image src={community.icon} mode="thumbnail" />
				{:else}
					<Icon icon="users" />
				{/if}
			</div>
			<span>
				<NameAtInstance place={community} displayName={community.title} prefix="" />
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
	import EllipsisText from './EllipsisText.svelte';
	import { getLemmySettings } from './lemmy-settings';

	export let community: Community;
	export let inlineLink = true;

	$: communityName = nameAtInstance(community);

	const ls = getLemmySettings();
</script>
