<UserLink user={person} />
<BusyButton on:click={$unblockState.submit} busy={$unblockState.busy}>Unblock</BusyButton>

<script lang="ts">
	import type { Person } from 'lemmy-js-client';
	import UserLink from '$lib/UserLink.svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import { createStatefulAction } from '$lib/utils';
	import { getLemmyClient } from '$lib/lemmy-client';

	export let person: Person;

	const dispatch = createEventDispatcher<{ unblock: number }>();
	const { client, jwt } = getLemmyClient();

	$: unblockState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		await client.blockPerson({
			auth: jwt,
			person_id: person.id,
			block: false
		});
		dispatch('unblock', person.id);
	});
</script>
