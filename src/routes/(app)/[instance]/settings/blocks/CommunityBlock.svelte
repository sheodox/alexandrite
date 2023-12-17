<CommunityLink {community} inlineLink={false} />
<BusyButton on:click={$unblockState.submit} busy={$unblockState.busy}>Unblock</BusyButton>

<script lang="ts">
	import type { Community } from 'lemmy-js-client';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import { createStatefulAction } from '$lib/utils';
	import { profile } from '$lib/profiles/profiles';

	export let community: Community;

	const dispatch = createEventDispatcher<{ unblock: number }>();
	$: client = $profile.client;
	$: jwt = $profile.jwt;

	$: unblockState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		await client.blockCommunity({
			community_id: community.id,
			block: false
		});
		dispatch('unblock', community.id);
	});
</script>
