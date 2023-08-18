<style lang="scss">
	$indent: var(--sx-spacing-10);
	.msg {
		border-radius: 20px;
		padding: var(--sx-spacing-3);
	}
	.message {
		&.sent {
			padding-left: #{$indent};
			.msg {
				background: var(--sx-blue-transparent-faint);
			}
		}

		&.recieved {
			padding-right: #{$indent};
			.msg {
				background: var(--sx-gray-transparent);
			}
		}
	}
</style>

<div class="message {toMe ? 'recieved' : 'sent'}">
	<div class="msg">
		<Stack dir="c" gap={2}>
			<Stack dir="r" gap={1}>
				<span>Message {toMe ? 'from' : 'to'}</span>
				<UserLink user={otherPerson} />
				<UserBadges user={otherPerson} />
				<span class="muted">&centerdot;</span>
				<RelativeTime date={privateMessageView.private_message.published} verb="Sent" />
				{#if privateMessageView.private_message.updated}
					<RelativeTime date={privateMessageView.private_message.updated} icon="edit" variant="icon" verb="Edited" />
				{/if}
			</Stack>
			<Markdown md={privateMessageView.private_message.content} />
			<Stack dir="r" gap={2} align="center">
				<slot name="actions-start" {toMe} />

				<IconButton
					icon="reply"
					small
					on:click={() => {
						showReply = true;
						showEdit = false;
					}}
					disabled={showReply}
					text="Reply"
				/>
				{#if !toMe}
					<IconButton
						icon="edit"
						small
						on:click={() => {
							showEdit = true;
							showReply = false;
						}}
						disabled={showEdit}
						text="Edit"
					/>
					<IconButton icon="trash-can" small on:click={onDelete} text="Delete" />
				{:else}
					<IconButton icon="flag" small on:click={() => (showReportModal = true)} text="Report" />
				{/if}

				<LogButton on:click={() => console.log({ privateMessageView })} />
			</Stack>

			{#if showReply}
				<PrivateMessageCompose
					label="Reply"
					to={otherPerson}
					on:cancel={() => (showReply = false)}
					cancellable
					on:sent={onReplied}
				/>
			{/if}
			{#if showEdit}
				<PrivateMessageCompose
					label="Edit Message"
					to={otherPerson}
					on:update={onEdited}
					on:cancel={() => (showEdit = false)}
					cancellable
					{privateMessageView}
				/>
			{/if}
		</Stack>
	</div>
</div>

{#if showReportModal}
	<ReasonModal on:reason={(e) => $reportState.submit(e)} bind:visible={showReportModal} busy={$reportState.busy} />
{/if}

<script lang="ts">
	import { Stack, createAutoExpireToast } from 'sheodox-ui';
	import RelativeTime from './RelativeTime.svelte';
	import Markdown from './Markdown.svelte';
	import type { PrivateMessageView } from 'lemmy-js-client';
	import ReasonModal from '$lib/ReasonModal.svelte';
	import IconButton from './IconButton.svelte';
	import UserLink from './UserLink.svelte';
	import PrivateMessageCompose from './PrivateMessageCompose.svelte';
	import LogButton from './LogButton.svelte';
	import UserBadges from './feeds/posts/UserBadges.svelte';
	import { profile } from './profiles/profiles';
	import { getContentViewStore, messageViewToContentView } from './content-views';
	import { createStatefulAction } from './utils';

	export let privateMessageView: PrivateMessageView;

	const cvStore = getContentViewStore();

	let showReply = false,
		showEdit = false,
		showReportModal = false;

	const reportState = createStatefulAction(async (e: CustomEvent<string>) => {
		if (!jwt) {
			return;
		}
		await client.createPrivateMessageReport({
			auth: jwt,
			reason: e.detail,
			private_message_id: privateMessageView.private_message.id
		});

		createAutoExpireToast({
			message: 'Message Reported'
		});
		showReportModal = false;
	});

	$: client = $profile.client;
	$: jwt = $profile.jwt;
	$: toMe = privateMessageView.recipient.local && privateMessageView.recipient.name === $profile.username;
	$: otherPerson = toMe ? privateMessageView.creator : privateMessageView.recipient;

	function onEdited(e: CustomEvent<PrivateMessageView>) {
		cvStore.updateView(messageViewToContentView(e.detail));
		showEdit = false;
	}

	function onReplied(e: CustomEvent<PrivateMessageView>) {
		cvStore.prepend([messageViewToContentView(e.detail)]);
		showReply = false;
	}

	async function onDelete() {
		if (!jwt) {
			return;
		}
		if (confirm('Are you sure you want to delete this message?')) {
			await client.deletePrivateMessage({
				auth: jwt,
				deleted: true,
				private_message_id: privateMessageView.private_message.id
			});
			cvStore.remove(privateMessageView.private_message.id);
		}
	}
</script>
