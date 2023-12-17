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
	import {
		getContentViewStore,
		mentionViewToContentView,
		messageViewToContentView,
		replyViewToContentView
	} from './content-views';
	export let content: { read: boolean; type: string; id: number };
	import { profile } from '$lib/profiles/profiles';

	const { checkUnread } = getAppContext();
	$: client = $profile.client;
	$: jwt = $profile.jwt;

	const cvStore = getContentViewStore();

	$: markReadState = createStatefulAction(async () => {
		if (!jwt) {
			return;
		}

		const id = content.id,
			// reverse 'read', so this can mark read or unread based on current state
			read = !content.read;

		if (content.type === 'reply') {
			const res = await client.markCommentReplyAsRead({
				comment_reply_id: id,
				read
			});

			cvStore.updateView(replyViewToContentView(res.comment_reply_view));
		} else if (content.type === 'mention') {
			const res = await client.markPersonMentionAsRead({
				person_mention_id: id,
				read
			});
			cvStore.updateView(mentionViewToContentView(res.person_mention_view));
		} else if (content.type === 'message') {
			const res = await client.markPrivateMessageAsRead({
				private_message_id: id,
				read
			});
			cvStore.updateView(messageViewToContentView(res.private_message_view));
		}
		checkUnread();
	});
</script>
