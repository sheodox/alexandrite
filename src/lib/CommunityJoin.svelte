{#if loggedIn}
	<form
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
		method="POST"
		action="/c/${communityView.community.id}/?/subscription"
		on:submit={() => (submitting = true)}
	>
		<input name="subscribed" type="hidden" value={communityView.subscribed} />
		<input name="communityId" type="hidden" value={communityView.community.id} />
		<button class:primary={!joined} class:tertiary={joined} class="mx-0" disabled={submitting}>
			{status}
		</button>
	</form>
{/if}

<script lang="ts">
	import type { CommunityView } from 'lemmy-js-client';
	import { enhance } from '$app/forms';
	import { getAppContext } from './app-context';
	const { loggedIn } = getAppContext();

	export let communityView: CommunityView;
	let submitting = false;

	$: joined = communityView.subscribed !== 'NotSubscribed';

	$: status = {
		Pending: 'Pending',
		Subscribed: 'Unsubscribe',
		NotSubscribed: 'Subscribe'
	}[communityView.subscribed];
</script>
