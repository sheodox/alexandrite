{#if loggedIn}
	<BusyButton cl="{!joined ? 'primary' : 'tertiary'} mx-0" busy={$joinState.busy} on:click={$joinState.submit}>
		{status}
	</BusyButton>
{/if}

<script lang="ts">
	import type { CommunityView } from 'lemmy-js-client';
	import BusyButton from './BusyButton.svelte';
	import { createStatefulAction } from './utils';
	import { communityViewToContentView, getContentViewStore } from './content-views';
	import { profile } from './profiles/profiles';

	$: client = $profile.client;
	$: jwt = $profile.jwt;
	$: loggedIn = $profile.loggedIn;
	const cvStore = getContentViewStore();

	export let communityView: CommunityView;
	$: joined = communityView.subscribed !== 'NotSubscribed';

	$: status = {
		Pending: 'Pending',
		Subscribed: 'Unsubscribe',
		NotSubscribed: 'Subscribe'
	}[communityView.subscribed];

	$: joinState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		const res = await client.followCommunity({
			follow: communityView.subscribed === 'NotSubscribed',
			community_id: communityView.community.id
		});

		cvStore.updateView(communityViewToContentView(res.community_view));
	});
</script>
