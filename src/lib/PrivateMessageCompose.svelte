<Stack dir="c" gap={2}>
	<Stack dir="r" gap={2} align="center">
		<span>Messaging</span>
		<UserLink user={to} />
	</Stack>
	<Alert variant="warning">Warning: Private messages on Lemmy are not secure.</Alert>
	{#if errorMsg}
		<Alert variant="error">Error: {errorMsg}</Alert>
	{/if}
	<form on:submit|preventDefault={submit} bind:this={messageForm}>
		<input type="hidden" name="recipientId" value={to.id} />
		<CommentEditor label="Message" {submitting} cancellable on:cancel submitButtonText="Send" useLanguage={false} />
	</form>
</Stack>

<script lang="ts">
	import type { Person } from 'lemmy-js-client';
	import { Stack, Alert } from 'sheodox-ui';
	import UserLink from './UserLink.svelte';
	import { createEventDispatcher } from 'svelte';
	import CommentEditor from './CommentEditor.svelte';

	const dispatch = createEventDispatcher<{
		sent: void;
	}>();

	let submitting = false,
		errorMsg = '',
		messageForm: HTMLFormElement;

	export let to: Person;

	async function submit() {
		submitting = true;
		const formData = new FormData(messageForm);

		const res = await fetch('/api/messages/', {
			method: 'POST',
			body: formData
		});

		submitting = true;

		if (res.ok) {
			dispatch('sent');
		} else {
			errorMsg = await res.text();

			try {
				errorMsg = JSON.parse(errorMsg)?.message ?? errorMsg;
			} catch (e) {}
		}
		submitting = false;
	}
</script>
