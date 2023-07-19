<BusyButton
	busy={$banFromCommunityState.busy}
	on:click={() => $banFromCommunityState.submit(!banned)}
	cl="m-0 {banned ? '' : 'tertiary'}"
	{small}
	icon={banned ? 'check' : 'ban'}
>
	{banned ? 'Unban' : 'Ban'}
</BusyButton>

<script lang="ts">
	import BusyButton from '$lib/BusyButton.svelte';
	import { getLemmyClient } from '$lib/lemmy-client';
	import { createStatefulAction } from '$lib/utils';
	import type { BanFromCommunityResponse } from 'lemmy-js-client';
	import { createEventDispatcher } from 'svelte';
	import { getBannedUsersStore } from './banned-users-context';

	const dispatch = createEventDispatcher<{
		ban: BanFromCommunityResponse;
	}>();

	const { client, jwt } = getLemmyClient();
	const bannedUsers = getBannedUsersStore();

	export let banned: boolean;
	export let personId: number;
	export let communityId: number;
	export let small = false;

	const banFromCommunityState = createStatefulAction<boolean>(async (ban) => {
		if (!jwt) {
			return;
		}
		const res = await client.banFromCommunity({
			auth: jwt,
			person_id: personId,
			community_id: communityId,
			ban
		});
		dispatch('ban', res);
		bannedUsers.update((b) => {
			b.set(personId, res.banned);
			return b;
		});
	});
</script>
