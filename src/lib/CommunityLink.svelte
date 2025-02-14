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
		&.large {
			height: 3rem;
			width: 3rem;
		}
	}
	.community-tooltip {
		// crosspost names can be long, don't let it get too big, though this is still huge unless on a phone
		max-width: 80vw;
	}
</style>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
	this={variant}
	href={href ? href : `/${$profile.instance}/c/${communityName}`}
	class={cl}
	class:inline-link={inlineLink}
	data-sveltekit-preload-data="off"
	on:click={() => dispatch('select', community)}
>
	{#if inlineLink}
		<Tooltip>
			<div slot="tooltip" class="community-tooltip">
				<Stack gap={1} dir="c">
					<Stack gap={2} dir="r" align="center">
						{#if community.icon && showIcon}
							<div class="community-avatar large">
								<Image src={community.icon} mode="thumbnail" />
							</div>
						{/if}
						<h1 class="sx-font-size-4 m-0">
							{community.title || community.name}
						</h1>
					</Stack>

					<div class="address">
						<NameAtInstance place={community} prefix="!" alwaysShowInstance />
					</div>

					<p class="m-0">
						Created <OriginDate date={community.published} /> ({toRelativeTime(community.published)})
					</p>
					<slot name="tooltip" />
				</Stack>
			</div>
			<span class="f-row gap-1 align-items-center">
				{#if community.icon && showIcon}
					<div class="community-avatar small">
						<Image src={community.icon} mode="thumbnail" thumbnailResolution={16} />
					</div>
				{:else}
					<!-- show a fallback avatar so stuff like CommunitySelector looks right -->
					<Avatar src={''} size="1rem" icon="users" />
				{/if}
				<EllipsisText
					><NameAtInstance place={community} displayName={community.title} prefix="" wrappable={false} /></EllipsisText
				>
				{#if showBadges}
					<CommunityBadges {community} />
				{/if}
			</span>
		</Tooltip>
	{:else}
		<Stack gap={2} dir="r" align="center" cl="icon-link">
			{#if $profile.settings.show_avatars && showIcon}
				<Avatar src={community.icon} size="2rem" icon="users" />
			{:else}
				<!-- show a fallback avatar so stuff like CommunitySelector looks right -->
				<Avatar src={''} size="2rem" icon="users" />
			{/if}
			<span>
				<NameAtInstance place={community} displayName={community.title} prefix="" />
			</span>
			{#if showBadges}
				<CommunityBadges {community} />
			{/if}
		</Stack>
	{/if}
</svelte:element>

<script lang="ts">
	import { Stack, Tooltip } from 'sheodox-ui';
	import Avatar from './Avatar.svelte';
	import Image from './Image.svelte';
	import { nameAtInstance } from './nav-utils';
	import { toRelativeTime } from './utils';
	import CommunityBadges from './feeds/posts/CommunityBadges.svelte';
	import type { Community } from 'lemmy-js-client';
	import NameAtInstance from './NameAtInstance.svelte';
	import EllipsisText from './EllipsisText.svelte';
	import { profile } from './profiles/profiles';
	import { getSettingsContext } from './settings-context';
	import { createEventDispatcher } from 'svelte';
	import OriginDate from './OriginDate.svelte';

	export let cl = '';
	export let variant: 'a' | 'button' | 'span' = 'a';
	export let community: Community;
	export let inlineLink = true;
	// if the link should actually go somewhere else, but still have community "branding", use that link instead.
	// this is used for links to crossposts, where the community should be the visible part of the link, but the
	// link should actually go to the post in that community
	export let href: string | null = null;
	export let showBadges = true;

	const dispatch = createEventDispatcher<{
		select: Community;
	}>();

	const { nsfwImageHandling } = getSettingsContext();

	$: communityName = nameAtInstance(community);

	// hide community avatars if the community is nsfw and the user doesn't want to explicitly see nsfw content,
	// as the community avatar often will also be nsfw
	$: nsfwShowable = !community.nsfw || $nsfwImageHandling === 'SHOW';

	// just in case, don't show icons for communities that were removed for some reason
	$: showIcon =
		$profile.settings.show_avatars && community.icon && !community.deleted && !community.removed && nsfwShowable;
</script>
