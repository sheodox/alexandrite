<style>
	.dn {
		display: none;
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
		<CommentEditor {submitting} label="Body" showSubmit={false} bind:value={content} required={false} />
	</Stack>

	<Stack dir="r" justify="end">
		<BusyButton cl="primary" style="width: 8rem;" disabled={!title} busy={submitting}>{postButtonText}</BusyButton>
	</Stack>
</Stack>

<script lang="ts">
	import CommentEditor from '$lib/CommentEditor.svelte';
	import { Alert, Stack, Checkbox, TextInput } from 'sheodox-ui';
	import BusyButton from './BusyButton.svelte';

	export let communityId: number;
	export let errorMessage = '';
	export let submitting: boolean;
	export let title = '';
	export let content = '';
	export let url = '';
	export let postButtonText = 'Post';

	$: disabled = submitting;
</script>
