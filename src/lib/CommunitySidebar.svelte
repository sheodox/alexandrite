<article>
	<Sidebar description={community.description ?? ''} bannerImageSrc={community.banner} context="Community">
		<a href="/c/{nameAtInstance(community)}" slot="name">
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
				</Stack>
			</Stack>
		</div>
		<div slot="end">
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
		</div>
	</Sidebar>
</article>

<script lang="ts">
	import { Stack, Icon, ExternalLink, Accordion } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import CommunityCounts from './CommunityCounts.svelte';
	import UserLink from './UserLink.svelte';
	import type { CommunityView, Community, CommunityModeratorView } from 'lemmy-js-client';
	import { nameAtInstance } from './nav-utils';

	export let community: Community;
	export let communityView: CommunityView | null = null;
	export let moderators: CommunityModeratorView[] | null = null;

	$: communityInstance = new URL(community.actor_id).host;
</script>
