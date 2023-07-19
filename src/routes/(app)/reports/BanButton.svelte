<BusyButton
	busy={$banFromCommunityState.busy}
	on:click={toggleBan}
	cl="m-0 {banned ? '' : 'tertiary'}"
	{small}
	icon={banned ? 'check' : 'ban'}
>
	{banned ? 'Unban' : 'Ban'}
</BusyButton>

{#if showReasonModal}
	<ReasonModal title="Ban" bind:visible={showReasonModal} busy={$banFromCommunityState.busy} on:reason={onBanReason} />
{/if}

<script lang="ts">
	import BusyButton from '$lib/BusyButton.svelte';
	import { getLemmyClient } from '$lib/lemmy-client';
	import ReasonModal from '$lib/ReasonModal.svelte';
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

	let showReasonModal = false;

	function toggleBan() {
		if (banned) {
			$banFromCommunityState.submit({
				ban: false
			});
		} else {
			showReasonModal = true;
		}
	}

	function onBanReason(e: CustomEvent<string>) {
		$banFromCommunityState.submit({
			ban: !banned,
			reason: e.detail
		});
	}

	const banFromCommunityState = createStatefulAction<{ ban: boolean; reason?: string }>(async ({ ban, reason }) => {
		if (!jwt) {
			return;
		}
		const res = await client.banFromCommunity({
			auth: jwt,
			person_id: personId,
			community_id: communityId,
			reason,
			ban
		});
		dispatch('ban', res);
		bannedUsers.update((b) => {
			b.set(personId, res.banned);
			return b;
		});

		showReasonModal = false;
	});
</script>
