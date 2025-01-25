<style lang="scss">
	.upload-preview {
		max-width: 100%;
		width: 30rem;
		border-radius: 10px;
		border: 2px solid var(--sx-gray-transparent-lighter);
		overflow: hidden;
	}
	.upload-url {
		font-family: monospace, sans-serif;
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		background: var(--sx-gray-transparent-darker);

		> .url {
			overflow-x: scroll;
			padding: var(--sx-spacing-3);
		}
	}
</style>

{#if upload.url}
	<div class="upload-preview">
		<div class="upload-url f-row align-items-center">
			<span class="url">{upload.url}</span>

			<IconButton
				on:click={() => upload.url && copyToClipboard(upload.url)}
				cl="tertiary mr-1"
				icon="copy"
				text="Copy URL"
				type="button"
				disabled={deleting}
			/>
			<IconButton
				on:click={() => deleteUpload(upload)}
				cl="delete-upload danger mr-1"
				icon="trash"
				text="Delete Image"
				type="button"
				disabled={deleting}
				busy={deleting}
			/>
		</div>
		<div class="media-preview">
			<Image src={upload.url} resizable={false} loadingHeight="20rem" />
		</div>
	</div>
{/if}

<script lang="ts">
	import type { UploadImageResponse } from 'lemmy-js-client';
	import IconButton from './IconButton.svelte';
	import Image from './Image.svelte';
	import { copyToClipboard } from './utils';
	import { createEventDispatcher } from 'svelte';
	import { profile } from './profiles/profiles';
	import { createAutoExpireToast } from 'sheodox-ui';

	export let upload: UploadImageResponse;

	let deleting = false;

	const dispatch = createEventDispatcher<{
		'delete-upload': UploadImageResponse;
	}>();

	async function deleteUpload(upload: UploadImageResponse) {
		if (!upload.delete_url) {
			return;
		}

		deleting = true;

		const deleteRes = await $profile.fetchFunction(upload.delete_url);

		if (deleteRes.ok) {
			dispatch('delete-upload', upload);
		} else {
			createAutoExpireToast({
				variant: 'error',
				message: 'Failed to delete image!'
			});
		}

		deleting = false;
	}
</script>
