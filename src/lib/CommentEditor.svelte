<style>
	textarea {
		border: 1px solid var(--sx-gray-transparent-lighter);
		resize: vertical;
	}
	.submitting {
		opacity: 0.7;
		pointer-events: none;
	}
</style>

<div class:submitting>
	<Stack dir="c" gap={2}>
		<Stack dir="c">
			<label for={textareaId} class="fw-bold">{label}</label>
			<textarea id={textareaId} rows="6" bind:value name="content" />
		</Stack>

		<Stack dir="r" justify="between" align="center">
			<a href="https://join-lemmy.org/docs/users/02-media.html" class="inline-link" target="_blank" rel="noreferrer"
				><Icon icon="circle-question" iconVariant="regular" />Formatting Help</a
			>
			<Stack dir="r" justify="end" align="center" gap={2}>
				<Checkbox bind:checked={showPreview}>Show Preview</Checkbox>
				{#if useLanguage}
					<select
						aria-label="language"
						name="languageId"
						required
						bind:value={selectedLanguage}
						on:change={saveSelectedLanguage}
					>
						{#each siteMeta.all_languages as lang}
							<option value={lang.id}>{lang.name}</option>
						{/each}
					</select>
				{/if}
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
		{#if showPreview && value}
			<Fieldset legend="Comment Preview">
				<Markdown md={value} />
			</Fieldset>
		{/if}
	</Stack>
</div>

<script lang="ts">
	import { Icon, Stack, Checkbox, Fieldset } from 'sheodox-ui';
	import { genId } from 'sheodox-ui/util';
	import Markdown from './Markdown.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { getAppContext } from './app-context';
	import BusyButton from './BusyButton.svelte';

	const dispatch = createEventDispatcher<{ cancel: void }>();

	const languageCacheKey = 'editor-language';
	const { siteMeta } = getAppContext();
	const englishLanguageId = siteMeta.all_languages.find(({ code }) => code === 'en')?.id;

	const textareaId = `comment-textarea-${genId()}`;
	let showPreview = false;

	export let label = 'Comment';
	export let submitButtonText = 'Post';
	export let value = '';
	export let selectedLanguage = 0;
	export let cancellable = false;
	export let required = false;
	export let submitting: boolean;
	export let showSubmit = true;
	export let useLanguage = true;
	const initialValue = value;

	onMount(() => {
		const cached = localStorage?.getItem(languageCacheKey);
		selectedLanguage = (cached ? Number(cached) : englishLanguageId) ?? 0;
	});

	function cancel() {
		if (value === initialValue || confirm('Are you sure you want to discard your comment?')) {
			dispatch('cancel');
		}
	}

	function saveSelectedLanguage() {
		localStorage.setItem(languageCacheKey, '' + selectedLanguage);
	}
</script>
