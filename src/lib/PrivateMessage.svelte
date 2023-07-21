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
				{#if toMe}
					<span>Message from</span>
					<UserLink user={privateMessageView.creator} />
					<UserBadges user={privateMessageView.creator} />
				{:else}
					<span>Message to</span>
					<UserLink user={privateMessageView.recipient} />
					<UserBadges user={privateMessageView.recipient} />
				{/if}
				<span class="muted">&centerdot;</span>
				<RelativeTime date={privateMessageView.private_message.published} />
			</Stack>
			<Markdown md={privateMessageView.private_message.content} />
			<Stack dir="r" gap={2} align="center">
				<slot name="actions-start" {toMe} />

				<IconButton icon="reply" small on:click={() => (showReply = true)} disabled={showReply} text="Reply" />
				<LogButton on:click={() => console.log({ privateMessageView })} />
			</Stack>

			{#if showReply}
				<div class="mx-8">
					<PrivateMessageCompose to={privateMessageView.creator} on:sent={sent} on:cancel={() => (showReply = false)} />
				</div>
			{/if}
		</Stack>
	</div>
</div>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import RelativeTime from './RelativeTime.svelte';
	import Markdown from './Markdown.svelte';
	import type { PrivateMessageView } from 'lemmy-js-client';
	import IconButton from './IconButton.svelte';
	import UserLink from './UserLink.svelte';
	import PrivateMessageCompose from './PrivateMessageCompose.svelte';
	import LogButton from './LogButton.svelte';
	import UserBadges from './feeds/posts/UserBadges.svelte';
	import { getAppContext } from './app-context';

	export let privateMessageView: PrivateMessageView;

	const { username } = getAppContext();

	let showReply = false;

	$: toMe = privateMessageView.recipient.local && privateMessageView.recipient.name === username;

	function sent() {
		showReply = false;
	}
</script>
