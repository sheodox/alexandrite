<form action="?/markRead" use:enhance={markReadSubmit} method="POST" on:submit={updateUnreadCount}>
	<input type="hidden" name="type" value={content.type} />
	<input type="hidden" name="id" value={content.id} />
	<input type="hidden" name="read" value={content.read} />
	<IconButton
		small
		busy={submitting}
		icon={content.read ? 'envelope-open' : 'envelope-circle-check'}
		text="Mark {content.read ? 'Unread' : 'Read'}"
		cl={content.read ? 'tertiary' : 'secondary'}
	/>
</form>

<script lang="ts">
	import IconButton from './IconButton.svelte';
	import { enhance } from '$app/forms';
	import { getAppContext } from './app-context';
	import type { SubmitFunction } from '@sveltejs/kit';
	export let content: { read: boolean; type: string; id: number };

	const { unreadCount } = getAppContext();

	let submitting = false;

	function updateUnreadCount() {
		submitting = true;
		unreadCount.update((unread) => unread + (content.read ? 1 : -1));
	}
	const markReadSubmit: SubmitFunction = () => {
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	};
</script>
