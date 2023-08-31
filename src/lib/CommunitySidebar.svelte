<article>
	<Sidebar description={community.description ?? ''} bannerImageSrc={community.banner} context="Community">
		<a href={communityHref} slot="name">
			<NameAtInstance place={community} prefix="!" />
		</a>

		<div slot="actions">
			<Stack dir="c" gap={2}>
				{#if communityView}
					<CommunityCounts {communityView} />
				{/if}
				<Stack dir="r" gap={2} align="center">
					<ExternalLink href={community.actor_id} cl="inline-link">
						<Icon icon="arrow-up-right-from-square" />
						View on {communityInstance}
					</ExternalLink>
					<ModlogLink
						communityId={community.id}
						highlight={userModerates ?? false}
						highlightColor="green"
						warn={warnModlog}
					/>
				</Stack>
			</Stack>
		</div>
		<div slot="end">
			<Stack dir="c" gap={2}>
				{#if moderators}
					<Accordion buttonClasses="tertiary">
						<span slot="title">Moderators ({moderators.length})</span>
						<Stack dir="c" gap={2}>
							{#each moderators as mod}
								<UserLink user={mod.moderator} />
							{/each}
						</Stack>
					</Accordion>
				{/if}
			</Stack>
		</div>
	</Sidebar>
</article>

<script lang="ts">
	import { Stack, Icon, ExternalLink, Accordion } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import CommunityCounts from './CommunityCounts.svelte';
	import ModlogLink from './ModlogLink.svelte';
	import UserLink from './UserLink.svelte';
	import type { CommunityView, Community, CommunityModeratorView } from 'lemmy-js-client';
	import { nameAtInstance } from './nav-utils';
	import { profile } from '$lib/profiles/profiles';
	import { getAppContext } from './app-context';
	import { getSettingsContext } from './settings-context';

	export let community: Community;
	export let communityView: CommunityView | null = null;
	export let moderators: CommunityModeratorView[] | null = null;

	const { siteMeta } = getAppContext();
	const { showModlogWarning, showModlogWarningModerated } = getSettingsContext();

	$: communityHref = `/${$profile.instance}/c/${nameAtInstance(community)}`;
	$: userModerates = $siteMeta.my_user?.moderates.some((moderates) => moderates.community.id === community.id);
	$: warnModlog = userModerates ? $showModlogWarningModerated : $showModlogWarning;

	$: communityInstance = new URL(community.actor_id).host;
</script>
