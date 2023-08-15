<style>
	.submitting {
		opacity: 0.7;
		pointer-events: none;
	}
</style>

<div class:submitting>
	<Stack dir="c" gap={2}>
		<Stack dir="c">
			<MarkdownEditor name="content" {label} bind:value {autofocus} />
		</Stack>

		<Stack dir="r" justify="between" align="center">
			{#if useLanguage}
				<LanguageSelector {selectedLanguage} validDiscussionLanguages={communityLanguages} />
			{:else}
				<!-- spacer to push the buttons to the end -->
				<div />
			{/if}
			<Stack dir="r" gap={2} align="center">
				{#if showSubmit}
					<BusyButton cl="secondary" busy={submitting} disabled={!value && required}>
						{submitButtonText}
					</BusyButton>
				{/if}
				{#if cancellable}
					<button class="tertiary" type="button" on:click={cancel}>Cancel</button>
				{/if}
			</Stack>
		</Stack>
	</Stack>
</div>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';
	import BusyButton from '../BusyButton.svelte';
	import MarkdownEditor from '../MarkdownEditor.svelte';
	import LanguageSelector from '../LanguageSelector.svelte';
	import { getCommunityContext } from '$lib/community-context/community-context';
	import { nameAtInstance } from '$lib/nav-utils';
	import type { Community } from 'lemmy-js-client';

	const dispatch = createEventDispatcher<{ cancel: void }>();

	export let label = 'Comment';
	export let submitButtonText = 'Post';
	export let value = '';
	export let selectedLanguage: number | null = null;
	export let cancellable = false;
	export let required = false;
	export let submitting: boolean;
	export let showSubmit = true;
	export let useLanguage = true;
	export let community: Community | undefined = undefined;
	export let autofocus = false;
	const initialValue = value;

	const communityContext = getCommunityContext();
	$: communityName = community ? nameAtInstance(community) : null;
	$: com = communityName ? communityContext.getCommunity(communityName) : null;
	$: communityLanguages = $com?.discussion_languages;

	function cancel() {
		if (value === initialValue || confirm('Are you sure you want to discard your comment?')) {
			dispatch('cancel');
		}
	}
</script>
