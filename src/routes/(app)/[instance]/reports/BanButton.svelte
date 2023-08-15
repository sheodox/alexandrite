<BusyButton
	busy={$busy}
	on:click={toggleBan}
	cl="m-0 {banned ? '' : 'tertiary'}"
	{small}
	icon={banned ? 'check' : 'ban'}
>
	{buttonText}
</BusyButton>

<script lang="ts">
	import BusyButton from '$lib/BusyButton.svelte';
	import type { BanFromCommunityResponse } from 'lemmy-js-client';
	import { createEventDispatcher } from 'svelte';
	import { getBannedUsersStore } from './banned-users-context';
	import { getModContext, getModActionPending } from '$lib/mod/mod-context';

	const dispatch = createEventDispatcher<{
		ban: BanFromCommunityResponse;
	}>();

	const modContext = getModContext();
	const bannedUsers = getBannedUsersStore();

	export let banned: boolean;
	export let personId: number;
	export let personName: string;
	export let communityId: number;
	// if we know the user is banned, show a disclaimer otherwise
	export let banStateKnown = true;
	export let small = false;

	const busy = getModActionPending('ban-person', personId);

	$: buttonText = [banned ? 'Unban' : 'Ban', banStateKnown ? '' : '(Unsure if banned)'].filter((x) => !!x).join(' ');

	async function toggleBan() {
		const res = await modContext.banPerson({ personId, personName, ban: !banned, communityId });

		if (res) {
			dispatch('ban', res);
			bannedUsers.update((b) => {
				b.set(personId, res.banned);
				return b;
			});
		}
	}
</script>
