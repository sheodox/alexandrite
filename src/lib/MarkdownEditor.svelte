<style lang="scss">
	textarea {
		resize: vertical;
	}
	.markdown-editor {
		border: 1px solid var(--sx-gray-transparent);
		background: var(--sx-gray-transparent);
		border-radius: 5px;

		:global(button) {
			margin: 0;
		}
	}
</style>

<div class="markdown-editor" style="--sx-arg-fieldset-legend-color: var(--sx-gray-75);">
	<Stack dir="c">
		<Stack dir="c">
			<Stack dir="r" gap={4} align="center" justify="between">
				<label for={textareaId} class="fw-bold p-2">{label}</label>
				{#if busy}
					<div class="px-2">
						<Spinner />
					</div>
				{:else if imageUploads.length}
					<button type="button" class="small" on:click={() => (showManageUploads = true)}
						><Icon icon="images" /> Manage Uploads</button
					>
				{/if}
			</Stack>
			<!-- svelte-ignore a11y-autofocus -->
			<textarea
				id={textareaId}
				rows="6"
				bind:value
				{name}
				{disabled}
				readonly={busy}
				bind:this={textarea}
				{required}
				on:keydown={keydown}
				{autofocus}
				on:paste={onPaste}
			/>
			<Stack dir="r" gap={1}>
				<IconButton icon="bold" text="Bold" type="button" on:click={format.bold} />
				<IconButton icon="italic" text="Italic" type="button" on:click={format.italic} />
				<IconButton icon="link" text="Link" type="button" on:click={format.link} />
				<IconButton icon="header" text="Header" type="button" on:click={format.header} />
				<IconButton icon="quote-left" text="Quote" type="button" on:click={format.quote} />
				<IconButton icon="code" text="Code" type="button" on:click={format.code} />
				<IconButton icon="strikethrough" text="Strikethrough" type="button" on:click={format.strikethrough} />
				<IconButton icon="subscript" text="Subscript" type="button" on:click={format.subscript} />
				<IconButton icon="superscript" text="Superscript" type="button" on:click={format.superscript} />
				<IconButton icon="triangle-exclamation" text="Spoiler" type="button" on:click={format.spoiler} />
			</Stack>
		</Stack>

		<Stack dir="r" justify="between" align="center" cl="p-2">
			<a href="https://join-lemmy.org/docs/users/02-media.html" class="inline-link" target="_blank" rel="noreferrer"
				><Icon icon="circle-question" variant="regular" /> Formatting Help</a
			>
			<Stack dir="r" justify="end" align="center" gap={2}>
				<Checkbox bind:checked={showPreview}>Show Preview</Checkbox>
			</Stack>
		</Stack>
		{#if showPreview && value}
			<Fieldset legend="Preview" fieldsetClasses="mb-2 mx-2">
				<Markdown md={value} />
			</Fieldset>
		{/if}
	</Stack>
</div>

{#if showManageUploads}
	<Modal title="Manage Uploads" bind:visible={showManageUploads}>
		<div class="modal-body f-column gap-4">
			{#each imageUploads as upload}
				<UploadedMedia {upload} on:delete-upload={onUploadDeleted} />
			{/each}
		</div>
	</Modal>
{/if}

<script lang="ts">
	import { Icon, Stack, Checkbox, Fieldset, Modal } from 'sheodox-ui';
	import { genId } from 'sheodox-ui/util';
	import Markdown from './Markdown.svelte';
	import IconButton from '$lib/IconButton.svelte';
	import { tick } from 'svelte';
	import { getCtrlBasedHotkeys } from './app-context';
	import { profile } from './profiles/profiles';
	import Spinner from './Spinner.svelte';
	import type { UploadImageResponse } from 'lemmy-js-client';
	import UploadedMedia from './UploadedMedia.svelte';

	const ctrlBasedHotkeys = getCtrlBasedHotkeys();

	const textareaId = `markdown-editor-${genId()}`;
	let showPreview = false;
	let textarea: HTMLTextAreaElement;

	export let label: string;
	export let value = '';
	export let name: string;
	export let disabled = false;
	export let required = true;
	export let autofocus = false;

	let busy = false;

	// TODO export and  cache this in a feed buffer for comments, so scrolling doesn't delete images!
	let imageUploads: UploadImageResponse[] = [];

	let showManageUploads = false;

	$: client = $profile.client;

	const format = {
		bold: () => applySurround('**'),
		italic: () => applySurround('*'),
		link: () => applySurround('[', ']($1)'),
		header: () => applyLeading('#', true),
		quote: () => applyLeading('>'),
		code: applyCode,
		strikethrough: () => applySurround('~~'),
		subscript: () => applySurround('~'),
		superscript: () => applySurround('^'),
		spoiler: applySpoiler
	};

	async function onUploadDeleted(e: CustomEvent<UploadImageResponse>) {
		const upload = e.detail;
		imageUploads = imageUploads.filter((u) => u.url !== upload.url);

		// remove just this image's markup from the text, if the image is
		// meant to be deleted, no reason to keep the markup to a dead link
		const imageEmbedReg = new RegExp(`!\\[.*?(?<!\\\\)\\]\\(${upload.url}\\)`, 'g');
		value = value.replace(imageEmbedReg, '');

		// if this was the last image, there's nothing to show in the dialog anymore
		if (imageUploads.length === 0) {
			showManageUploads = false;
		}
	}

	async function applyCode() {
		const start = textarea.selectionStart,
			end = textarea.selectionEnd,
			isMultiLine = value.substring(start, end).includes('\n');

		isMultiLine ? applySurround('```\n', '\n```') : applySurround('`');
	}

	async function applySpoiler() {
		// we need newlines to surround the spoiler markup or it won't work, so if there aren't any, add them.
		// but first test to see if they're necessary or it'll add extra newlines we don't want
		const startsWithNewline = textarea.selectionStart === 0 || value.at(textarea.selectionStart - 1) === '\n',
			endsWithNewline = textarea.selectionEnd === value.length || value.at(textarea.selectionEnd) === '\n',
			surroundStart = (startsWithNewline ? '' : '\n') + '::: spoiler spoiler\n',
			surroundEnd = '\n:::' + (endsWithNewline ? '' : '\n');
		applySurround(surroundStart, surroundEnd);
	}

	async function keydown(e: KeyboardEvent) {
		const ctrl = ctrlBasedHotkeys ? e.ctrlKey : e.metaKey,
			key = e.key;

		let handled = false;

		if (ctrl) {
			if (key === 'b') {
				format.bold();
				handled = true;
			} else if (key === 'i') {
				format.italic();
				handled = true;
			}
		}

		if (handled) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	async function applySurround(surroundStart: string, surroundEnd?: string) {
		surroundEnd ??= surroundStart;
		const surroundEndNoPlaceholder = surroundEnd.replace('$1', '');

		const start = textarea.selectionStart,
			end = textarea.selectionEnd;

		value =
			value.substring(0, start) +
			surroundStart +
			value.substring(start, end) +
			surroundEndNoPlaceholder +
			value.substring(end);
		await tick();
		textarea.focus();

		// stuff like links need your cursor to go to a specific place, put it there
		if (surroundEnd.includes('$1')) {
			const endCursorPos = surroundEnd.indexOf('$1'),
				placeholderPos = end + endCursorPos + 1;
			textarea.selectionStart = placeholderPos;
			textarea.selectionEnd = placeholderPos;
		} else {
			textarea.selectionStart = start + surroundStart.length;
			textarea.selectionEnd = end + surroundStart.length;
		}
	}

	async function applyLeading(leading: string, padSpace = false) {
		const start = textarea.selectionStart,
			end = textarea.selectionEnd;

		// find the start of this line
		let lineStartPos = 0;

		for (let i = start; i > 0; i--) {
			if (value.at(i) === '\n') {
				lineStartPos = i + 1;
				break;
			}
		}

		const addSpace = padSpace && value.at(lineStartPos) !== leading,
			leadingStr = leading + (addSpace ? ' ' : '');

		value = value.substring(0, lineStartPos) + leadingStr + value.substring(lineStartPos);
		await tick();
		textarea.focus();

		textarea.selectionStart = start + leadingStr.length;
		textarea.selectionEnd = end + leadingStr.length;
	}

	async function onPaste(e: ClipboardEvent) {
		const file = e.clipboardData?.files.item(0);
		if (file && file.type.includes('image')) {
			busy = true;
			const { selectionStart } = textarea,
				res = await client.uploadImage({
					image: file
				});

			imageUploads = [...imageUploads, res];

			value = value.substring(0, selectionStart) + '![](' + res.url + ')' + value.substring(selectionStart);

			await tick();
			textarea.focus();
			textarea.selectionStart = selectionStart + 2; // place cursor in the alt text location
			textarea.selectionEnd = selectionStart + 2;

			busy = false;
		}
	}
</script>
