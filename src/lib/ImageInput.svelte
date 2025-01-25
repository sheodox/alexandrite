<style lang="scss">
	.image-input {
		border: 1px solid var(--sx-gray-transparent-lighter);
		overflow: hidden;
	}
	.input-container.has-upload {
		border-bottom: 1px solid var(--sx-gray-transparent-lighter);
	}
	label {
		border-right: 1px solid var(--sx-gray-transparent-lighter);
		background: var(--sx-gray-transparent-dark);
		line-height: 1.7;
	}
	.input-container {
		align-items: stretch;
	}
	.input-busy {
		width: 0;
		visibility: hidden;
	}
</style>

<div class="image-input f-column card card-body p-0">
	<div class="input-container f-row gap-4" class:has-upload={!!mostRecentUpload}>
		<label for="post-compose-image-file-input" class="p-4"> <Icon icon="image" /> Image </label>
		<input
			type="file"
			accept="image/*,video/*"
			id="post-compose-image-file-input"
			class="py-4"
			on:change={onFileInputChange}
			class:px-4={!busy}
			class:input-busy={busy}
			disabled={busy}
			bind:this={elFileInput}
		/>
		{#if busy}
			<div class="f-row justify-content-center align-items-center">
				<Spinner />
			</div>
		{/if}
	</div>
	{#if mostRecentUpload}
		<div class="m-4">
			{#key mostRecentUpload}
				<UploadedMedia upload={mostRecentUpload} on:delete-upload={onDeleteUpload} />
			{/key}
		</div>
	{/if}
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import type { UploadImageResponse } from 'lemmy-js-client';
	import { createEventDispatcher } from 'svelte';
	import { profile } from './profiles/profiles';
	import UploadedMedia from './UploadedMedia.svelte';
	import Spinner from './Spinner.svelte';

	const dispatch = createEventDispatcher<{
		// when an uploaded image is deleted
		'delete-upload': UploadImageResponse;
		// when an image is uplaoded
		upload: UploadImageResponse;
	}>();

	function onDeleteUpload(e: CustomEvent<UploadImageResponse>) {
		mostRecentUpload = null;
		dispatch('delete-upload', e.detail);
	}

	// if currently doing an upload
	let busy = false;

	let mostRecentUpload: null | UploadImageResponse = null;

	let elFileInput: HTMLInputElement;

	$: client = $profile.client;

	async function onFileInputChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const file = e.currentTarget?.files?.item(0);
		if (file && file.type.includes('image')) {
			e.currentTarget.value = '';
			busy = true;

			const res = await client.uploadImage({
				image: file
			});

			mostRecentUpload = res;

			busy = false;

			dispatch('upload', res);
		}
	}
</script>
