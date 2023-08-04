<style>
	.dn {
		display: none;
	}
</style>

<Stack dir="c" gap={2}>
	{#if errorMessage}
		<Alert variant="error">{errorMessage}</Alert>
	{/if}

	<input name="communityId" value={community.id} type="hidden" />
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
		<LanguageSelector validDiscussionLanguages={discussionLanguages} />
		<BusyButton cl="primary" style="width: 8rem;" disabled={!title} busy={submitting}>{postButtonText}</BusyButton>
	</Stack>
</Stack>

<script lang="ts">
	import MarkdownEditor from './MarkdownEditor.svelte';
	import { Alert, Stack, Checkbox, TextInput } from 'sheodox-ui';
	import BusyButton from './BusyButton.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import { getCommunityContext } from './community-context/community-context';
	import type { Community } from 'lemmy-js-client';

	export let community: Community;
	export let errorMessage = '';
	export let submitting: boolean;
	export let title = '';
	export let content = '';
	export let url = '';
	export let postButtonText = 'Post';

	$: disabled = submitting;

	const communityContext = getCommunityContext();
	$: communityRes = communityContext.getFullCommunity(community);

	$: discussionLanguages = $communityRes?.discussion_languages;
</script>
