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
		<MarkdownEditor label="Post Text" name="content" bind:value={content} required={false} />
	</Stack>

	<Stack dir="r" justify="between">
		<LanguageSelector />
		<BusyButton cl="primary" style="width: 8rem;" disabled={!title} busy={submitting}>{postButtonText}</BusyButton>
	</Stack>
</Stack>

<script lang="ts">
	import MarkdownEditor from './MarkdownEditor.svelte';
	import { Alert, Stack, Checkbox, TextInput } from 'sheodox-ui';
	import BusyButton from './BusyButton.svelte';
	import LanguageSelector from './LanguageSelector.svelte';

	export let communityId: number;
	export let errorMessage = '';
	export let submitting: boolean;
	export let title = '';
	export let content = '';
	export let url = '';
	export let postButtonText = 'Post';

	$: disabled = submitting;
</script>
