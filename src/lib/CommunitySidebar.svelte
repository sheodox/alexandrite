<article>
	<Sidebar description={community.description ?? ''} bannerImageSrc={community.banner} context="Community">
		<span slot="name">
			<NameAtInstance place={community} prefix="!" />
			<ExternalLink href={community.actor_id}>
				<Icon icon="arrow-up-right-from-square" />
			</ExternalLink>
		</span>

		<div slot="actions">
			{#if communityView}
				<CommunityCounts {communityView} />
			{/if}
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

	export let community: Community;
	export let communityView: CommunityView | null = null;
	export let moderators: CommunityModeratorView[] | null = null;
</script>
