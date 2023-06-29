{#if loggedIn}
	<form method="POST" action="" bind:this={form} on:submit|preventDefault={onSubmit}>
		<input name="subscribed" type="hidden" value={cv.subscribed} />
		<input name="communityId" type="hidden" value={cv.community.id} />
		<button class:primary={!joined} class:tertiary={joined} class="mx-0" disabled={submitting}>
			{status}
		</button>
	</form>
{/if}

<script lang="ts">
	import type { CommunityView } from 'lemmy-js-client';
	import { getAppContext } from './app-context';
	const { loggedIn } = getAppContext();

	export let communityView: CommunityView;
	// cache our own version with updated subscribe status, instead of allowing
	// a parent component's re-render to overwrite with stale data, not that important
	// outside of this component to bother dispatching an update
	let cv = communityView;

	let submitting = false,
		form: HTMLFormElement;

	$: joined = cv.subscribed !== 'NotSubscribed';

	$: status = {
		Pending: 'Pending',
		Subscribed: 'Unsubscribe',
		NotSubscribed: 'Subscribe'
	}[cv.subscribed];

	async function onSubmit() {
		const formData = new FormData(form);

		submitting = true;
		const res = await fetch('/c/${cv.community.id}/subscription', {
			method: 'POST',
			body: formData
		});
		if (res.ok) {
			cv = await res.json().then(({ communityView }) => communityView);
		}
		submitting = false;
	}
</script>
