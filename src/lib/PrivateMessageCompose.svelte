<Stack dir="c" gap={2}>
	<Stack dir="r" gap={2} align="center">
		<span>Messaging</span>
		<UserLink user={to} />
	</Stack>
	<Alert variant="warning">Warning: Private messages on Lemmy are not secure.</Alert>
	<form bind:this={messageForm} use:submitOnHardEnter>
		<CommentEditor
			{label}
			submitting={$messageState.busy}
			{cancellable}
			on:cancel
			submitButtonText="Send"
			useLanguage={false}
			bind:value={messageText}
			autofocus
		/>
	</form>
</Stack>

<script lang="ts">
	import type { Person, PrivateMessageResponse, PrivateMessageView } from 'lemmy-js-client';
	import { Stack, Alert } from 'sheodox-ui';
	import UserLink from './UserLink.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import CommentEditor from './comments/CommentEditor.svelte';
	import { createStatefulForm, submitOnHardEnter } from './utils';
	import { profile } from './profiles/profiles';

	const dispatch = createEventDispatcher<{
		sent: PrivateMessageView;
		update: PrivateMessageView;
	}>();

	$: client = $profile.client;
	$: jwt = $profile.jwt;

	export let label = 'Message';
	export let to: Person;
	export let cancellable = false;
	// if they are editing a message, this is the message they're editing
	export let privateMessageView: PrivateMessageView | null = null;

	let messageForm: HTMLFormElement,
		messageText = '';

	onMount(() => {
		// if they're editing a message, initialize the textarea with the message
		if (privateMessageView) {
			messageText = privateMessageView.private_message.content;
		}
	});

	$: messageState = createStatefulForm(messageForm, async (body) => {
		if (!jwt) {
			return;
		}

		try {
			let res: PrivateMessageResponse;
			// if they're editing a message, save the changes, don't send a new one
			if (privateMessageView) {
				res = await client.editPrivateMessage({
					auth: jwt,
					content: body.content as string,
					private_message_id: privateMessageView.private_message.id
				});
				// send it back up to the parent, so edits can be shown
				dispatch('update', res.private_message_view);
			} else {
				//else just create a new message
				res = await client.createPrivateMessage({
					auth: jwt,
					content: body.content as string,
					recipient_id: to.id
				});
				// send it back up to the parent, so it can be seen
				dispatch('sent', res.private_message_view);
			}

			messageText = '';
		} catch (e) {
			/* ignore */
		}
	});
</script>
