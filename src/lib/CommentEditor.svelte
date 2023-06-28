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
				<button class="secondary f-row gap-2" disabled={!value}>
					{#if submitting}
						<Spinner />
					{/if}
					Post
				</button>
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
	import { createEventDispatcher } from 'svelte';
	import Spinner from './Spinner.svelte';

	const dispatch = createEventDispatcher<{ cancel: void }>();

	const textareaId = `comment-textarea-${genId()}`;
	let showPreview = false;

	export let label = 'Comment';
	export let value = '';
	export let cancellable = false;
	export let submitting: boolean;

	function cancel() {
		if (!value || confirm('Are you sure you want to discard your comment?')) {
			dispatch('cancel');
		}
	}
</script>
