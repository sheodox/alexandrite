<style>
	.dn {
		display: none;
	}
	button {
		width: 8rem;
	}
</style>

<Stack dir="c" gap={2}>
	{#if errorMessage}
		<Alert variant="error">{errorMessage}</Alert>
	{/if}

	<input name="communityId" value={communityId} type="hidden" />
	<input name="honeypot" value="" class="dn" />

	<TextInput name="title" bind:value={title}>Title</TextInput>
	<TextInput name="url" bind:value={url}>URL</TextInput>
	<div class="ml-1">
		<Checkbox name="nsfw" {disabled}>NSFW</Checkbox>
	</div>
	<Stack dir="c" cl="mt-2">
		<CommentEditor {submitting} label="Body" showSubmit={false} bind:value={content} />
	</Stack>

	<Stack dir="r" justify="end">
		<button class="primary" disabled={!title}>Post</button>
	</Stack>
</Stack>

<script lang="ts">
	import CommentEditor from '$lib/CommentEditor.svelte';
	import { Alert, Stack, Checkbox, TextInput } from 'sheodox-ui';

	export let communityId: number;
	export let errorMessage = '';
	export let submitting: boolean;
	export let title = '';
	export let content = '';
	export let url = '';

	$: disabled = submitting;
</script>
