<Stack dir="c" gap={2}>
	<Stack dir="r" gap={2}>
		<NameAtInstance place={privateMessageView.creator} prefix="@" />
		<span class="muted">&centerdot;</span>
		<RelativeTime date={privateMessageView.private_message.published} />
	</Stack>
	<Markdown md={privateMessageView.private_message.content} />
	<Stack dir="r" gap={2} align="center">
		<slot name="actions-start" />
	</Stack>
</Stack>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import NameAtInstance from './NameAtInstance.svelte';
	import RelativeTime from './RelativeTime.svelte';
	import Markdown from './Markdown.svelte';
	import type { PrivateMessageView } from 'lemmy-js-client';

	export let privateMessageView: PrivateMessageView;
</script>
