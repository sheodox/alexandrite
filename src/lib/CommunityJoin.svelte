{#if loggedIn}
	<BusyButton cl="{!joined ? 'primary' : 'tertiary'} mx-0" busy={$joinState.busy} on:click={$joinState.submit}>
		{status}
	</BusyButton>
{/if}

<script lang="ts">
	import type { CommunityView } from 'lemmy-js-client';
	import { getAppContext } from './app-context';
	import BusyButton from './BusyButton.svelte';
	import { createStatefulAction } from './utils';
	import { getLemmyClient } from './lemmy-client';

	const { loggedIn } = getAppContext();
	const { client, jwt } = getLemmyClient();

	export let communityView: CommunityView;
	// cache our own version with updated subscribe status, instead of allowing
	// a parent component's re-render to overwrite with stale data, not that important
	// outside of this component to bother dispatching an update
	let cv = communityView;
	$: joined = cv.subscribed !== 'NotSubscribed';

	$: status = {
		Pending: 'Pending',
		Subscribed: 'Unsubscribe',
		NotSubscribed: 'Subscribe'
	}[cv.subscribed];

	$: joinState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		const res = await client.followCommunity({
			auth: jwt,
			follow: cv.subscribed === 'NotSubscribed',
			community_id: cv.community.id
		});

		cv = res.community_view;
	});
</script>
