<div class="f-1">
	<div class="p-2">{instance.domain}</div>
</div>
<BusyButton on:click={$unblockState.submit} busy={$unblockState.busy} cl="tertiary">Unblock</BusyButton>

<script lang="ts">
	import type { Instance } from 'lemmy-js-client';
	import BusyButton from '$lib/BusyButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import { createStatefulAction } from '$lib/utils';
	import { profile } from '$lib/profiles/profiles';

	export let instance: Instance;

	const dispatch = createEventDispatcher<{ unblock: number }>();
	$: client = $profile.client;
	$: jwt = $profile.jwt;

	$: unblockState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		await client.blockInstance({
			instance_id: instance.id,
			block: false
		});
		dispatch('unblock', instance.id);
	});
</script>
