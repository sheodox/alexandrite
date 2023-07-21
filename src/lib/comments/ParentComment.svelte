<style>
	.comment-text {
		max-height: 5rem;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 20rem;
	}
</style>

<Stack dir="c" gap={2}>
	<p class="m-0 f-row gap-1">Reply to <UserLink user={view.creator} /></p>
	<div class="comment-text">
		<Markdown md={view.comment.content} noImages />
	</div>
</Stack>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import type { CommentView } from 'lemmy-js-client';
	import UserLink from '$lib/UserLink.svelte';
	import Markdown from '$lib/Markdown.svelte';

	export let view: CommentView;
</script>
