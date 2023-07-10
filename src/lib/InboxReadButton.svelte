<IconButton
	small
	busy={$markReadState.busy}
	icon={content.read ? 'envelope-open' : 'envelope-circle-check'}
	text="Mark {content.read ? 'Unread' : 'Read'}"
	cl={content.read ? 'tertiary' : 'secondary'}
	on:click={$markReadState.submit}
/>

<script lang="ts">
	import IconButton from './IconButton.svelte';
	import { getAppContext } from './app-context';
	import { createStatefulAction } from './utils';
	import { getLemmyClient } from './lemmy-client';
	import { createEventDispatcher } from 'svelte';
	export let content: { read: boolean; type: string; id: number };

	const { checkUnread } = getAppContext();
	const { client, jwt } = getLemmyClient();

	const dispatch = createEventDispatcher<{
		read: boolean;
	}>();

	$: markReadState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		const id = content.id,
			// reverse 'read', so this can mark read or unread based on current state
			read = !content.read;

		switch (content.type as string) {
			case 'reply':
				await client.markCommentReplyAsRead({
					auth: jwt,
					comment_reply_id: id,
					read
				});
				break;
			case 'mention':
				await client.markPersonMentionAsRead({
					auth: jwt,
					person_mention_id: id,
					read
				});
				break;
			case 'message':
				await client.markPrivateMessageAsRead({
					auth: jwt,
					private_message_id: id,
					read
				});
				break;
		}

		dispatch('read', read);

		checkUnread();
	});
</script>
