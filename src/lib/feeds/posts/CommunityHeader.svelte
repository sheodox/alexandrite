<FeedHeader icon={communityView.community.icon ?? ''} published={communityView.community.published}>
	<NameAtInstance place={communityView.community} prefix="!" slot="name" />
	<Stack dir="r" gap={2} align="center" slot="actions">
		{#if !readOnly}
			<CommunityJoin {communityView} on:update-community />
			<a href="/c/{nameAtInstance(communityView.community)}/post" class="button tertiary">
				<Icon icon="plus" /> Post
			</a>
			<a href="/search?community={nameAtInstance(communityView.community)}" class="button tertiary">
				<Icon icon="magnifying-glass" /> Search
			</a>
			<BusyButton
				on:click={() => $blockState.submit(!communityView.blocked)}
				busy={$blockState.busy}
				cl={communityView.blocked ? 'danger' : 'tertiary'}
			>
				{#if !communityView.blocked}
					<Icon icon="ban" />
					Block
				{:else}
					<Icon icon="circle-check" iconVariant="regular" />
					Unblock
				{/if}
			</BusyButton>
		{/if}
	</Stack>
	<div slot="badges">
		<CommunityBadges community={communityView.community} extended />
	</div>
</FeedHeader>

<script lang="ts">
	import { Icon, Stack } from 'sheodox-ui';
	import type { CommunityView } from 'lemmy-js-client';
	import FeedHeader from './FeedHeader.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import CommunityBadges from './CommunityBadges.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import CommunityJoin from '$lib/CommunityJoin.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import { createStatefulAction } from '$lib/utils';
	import { getLemmyClient } from '$lib/lemmy-client';
	import { invalidateAll } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		'update-community': CommunityView;
	}>();

	export let communityView: CommunityView;
	export let readOnly = false;
	const { client, jwt } = getLemmyClient();

	$: blockState = createStatefulAction<boolean>(async (block) => {
		if (!jwt) {
			return;
		}
		const res = await client.blockCommunity({
			auth: jwt,
			community_id: communityView.community.id,
			block
		});

		if (!block) {
			// reload the page to update what's in the feed if they just unblocked,
			// not reloading if they just blocked because they're probably going to go
			// somewhere else so it'd be a useless page load
			invalidateAll();
		}

		dispatch('update-community', res.community_view);
	});
</script>
