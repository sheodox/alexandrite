<Stack dir="c" gap={2}>
	<Stack dir="r" gap={2} align="center">
		<span>Messaging</span>
		<UserLink user={to} />
	</Stack>
	<Alert variant="warning">Warning: Private messages on Lemmy are not secure.</Alert>
	<form bind:this={messageForm}>
		<CommentEditor
			label="Message"
			submitting={$messageState.busy}
			{cancellable}
			on:cancel
			submitButtonText="Send"
			useLanguage={false}
			bind:value={messageText}
		/>
	</form>
</Stack>

<script lang="ts">
	import type { Person } from 'lemmy-js-client';
	import { Stack, Alert } from 'sheodox-ui';
	import UserLink from './UserLink.svelte';
	import { createEventDispatcher } from 'svelte';
	import CommentEditor from './comments/CommentEditor.svelte';
	import { createStatefulForm } from './utils';
	import { profile } from './profiles/profiles';

	const dispatch = createEventDispatcher<{
		sent: void;
	}>();

	$: client = $profile.client;
	$: jwt = $profile.jwt;

	let messageForm: HTMLFormElement,
		messageText = '';

	export let to: Person;
	export let cancellable = false;

	$: messageState = createStatefulForm(messageForm, async (body) => {
		if (!jwt) {
			return;
		}

		try {
			await client.createPrivateMessage({
				auth: jwt,
				content: body.content as string,
				recipient_id: to.id
			});
			dispatch('sent');
			messageText = '';
		} catch (e) {
			/* ignore */
		}
	});
</script>
