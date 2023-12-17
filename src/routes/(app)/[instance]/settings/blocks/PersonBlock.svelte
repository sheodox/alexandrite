<UserLink user={person} />
<BusyButton on:click={$unblockState.submit} busy={$unblockState.busy}>Unblock</BusyButton>

<script lang="ts">
	import type { Person } from 'lemmy-js-client';
	import UserLink from '$lib/UserLink.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import { createStatefulAction } from '$lib/utils';
	import { profile } from '$lib/profiles/profiles';

	export let person: Person;

	const dispatch = createEventDispatcher<{ unblock: number }>();
	$: client = $profile.client;
	$: jwt = $profile.jwt;

	$: unblockState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		await client.blockPerson({
			person_id: person.id,
			block: false
		});
		dispatch('unblock', person.id);
	});
</script>
