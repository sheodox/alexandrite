<Stack dir="c" gap={2}>
	<Stack dir="r" gap={2} align="center">
		<span>Messaging</span>
		<UserLink user={to} />
	</Stack>
	<Alert variant="warning">Warning: Private messages on Lemmy are not secure.</Alert>
	{#if errorMsg}
		<Alert variant="error">Error: {errorMsg}</Alert>
	{/if}
	<form bind:this={messageForm}>
		<CommentEditor
			label="Message"
			submitting={$messageState.busy}
			cancellable
			on:cancel
			submitButtonText="Send"
			useLanguage={false}
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
	import { getLemmyClient } from './lemmy-client';
	import { getMessageFromError } from './error-messages';

	const dispatch = createEventDispatcher<{
		sent: void;
	}>();

	const { client, jwt } = getLemmyClient();

	let errorMsg = '',
		messageForm: HTMLFormElement;

	export let to: Person;

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
		} catch (e) {
			errorMsg = getMessageFromError(e);
		}
	});
</script>
