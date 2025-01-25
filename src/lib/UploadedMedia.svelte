<style lang="scss">
	.upload-preview {
		max-width: 100%;
		width: 30rem;
		border-radius: 10px;
		border: 2px solid var(--sx-gray-transparent-lighter);
		overflow: hidden;
		flex-shrink: 0;
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

	video {
		width: 100%;
	}
</style>

{#if currentUploadUrl || upload?.url}
	<div class="upload-preview">
		<div class="upload-url f-row align-items-center">
			<span class="url">{upload?.url ?? currentUploadUrl}</span>
			<IconButton
				on:click={onCopyClick}
				cl="tertiary mr-1"
				icon="copy"
				text="Copy URL"
				type="button"
				disabled={deleting}
			/>
			{#if upload}
				<IconButton
					on:click={() => deleteUpload(upload)}
					cl="delete-upload danger mr-1"
					icon="trash"
					text="Delete Image"
					type="button"
					disabled={deleting}
					busy={deleting}
				/>
			{:else if currentUploadUrl}
				<IconButton
					on:click={() => (currentUploadUrl = '')}
					cl="mr-1 tertiary"
					icon="times"
					text="Remove"
					type="button"
				/>
			{/if}
		</div>
		<div class="media-preview">
			{#if hasImageExtension(upload?.url ?? currentUploadUrl)}
				<Image src={upload?.url ?? currentUploadUrl} resizable={false} loadingHeight="20rem" />
			{:else if upload && hasVideoExtension(upload.url)}
				<!-- svelte-ignore a11y-media-has-caption -->
				<video src={upload.url} controls />
			{:else if currentUploadUrl}
				<Image src={currentUploadUrl} resizable={false} loadingHeight="20rem" />
				<Avatar src={currentUploadUrl} icon="user-circle" size="4rem" />
			{/if}
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
	import { hasImageExtension, hasVideoExtension } from './feeds/posts/post-utils';
	import Avatar from './Avatar.svelte';

	export let upload: UploadImageResponse | null = null;
	// the url of the current avatar/icon/etc, if we don't have the upload response
	export let currentUploadUrl = '';

	let deleting = false;

	const dispatch = createEventDispatcher<{
		'delete-upload': UploadImageResponse;
	}>();

	function onCopyClick() {
		const text = upload?.url ?? currentUploadUrl;
		if (text) {
			copyToClipboard(text);
		}
	}

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
