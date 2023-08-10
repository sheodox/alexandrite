<style>
	p {
		margin: 0;
	}
</style>

<Title title="Hotkeys - Help" />

<p>Several hotkeys are available depending on where you are focused.</p>

<p>
	<Icon icon="question-circle" variant="regular" />
	Hotkeys that perform an action on the "current post/comment" (like voting) will perform that action on the first post/comment
	at the top of your screen.
</p>

<HotkeyTable caption="Feed hotkeys" hotkeys={feedHotkeys} />
<HotkeyTable caption="When viewing a post/comments" hotkeys={postHotkeys} />

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import Title from '$lib/Title.svelte';
	import HotkeyTable from './HotkeyTable.svelte';

	const feedHotkeys = [
		{
			key: 'j',
			description: 'Scroll to the next post'
		},
		{
			key: 'k',
			description: 'Scroll to the previous post'
		},
		{
			key: 's',
			description: 'Save/unsave the current post'
		},
		{
			key: 'a',
			description: 'Upvote the current post'
		},
		{
			key: 'z',
			description: 'Downvote the current post'
		},
		{
			key: 'Enter',
			description: 'Open the current post'
		}
	];

	const postHotkeys = [
		{
			key: 'j',
			description: 'Scroll to the next comment'
		},
		{
			key: 'Shift+j',
			description: 'Scroll to the next top level comment, or next search result if searching'
		},
		{
			key: 'k',
			description: 'Scroll to the previous comment'
		},
		{
			key: 'Shift+k',
			description: 'Scroll to the previous top level comment, or previous search result if searching'
		},
		{
			key: 's',
			description: 'Save the current comment'
		},
		{
			key: 'a',
			description: 'Upvote the current comment'
		},
		{
			key: 'z',
			description: 'Downvote the current comment'
		},
		{
			key: 'Shift+a',
			description: 'Upvote the post'
		},
		{
			key: 'Shift+z',
			description: 'Downvote the post'
		},
		{
			key: 'Escape',
			description: 'Close the current post'
		}
	];
</script>
