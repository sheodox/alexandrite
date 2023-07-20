<style lang="scss">
	img {
		max-width: 100%;
	}
	.image-mode-full:not(.image-full) img {
		max-width: 20rem;
	}
	.error {
		background: var(--sx-gray-transparent);
		height: 100%;
		width: 100%;
	}
	.show-nsfw {
		background: var(--sx-red-transparent-faint);
		color: var(--sx-red-400);
		margin: 0;
	}
	.image-mode-thumbnail.blur:not(:hover) img {
		filter: blur(10px);
	}
</style>

{#if error}
	<div class="error align-items-center justify-content-center f-row" title="Image load failed">
		<Icon icon="bug" />
	</div>
{:else if nsfw && $nsfwImageHandling === 'HIDE' && !showAnyway}
	<button class="img show-nsfw" on:click|stopPropagation={() => (showAnyway = true)}>Show NSFW</button>
{:else if valid}
	<picture class="image-mode-{mode} {full ? 'image-full' : ''}" class:blur={nsfw && $nsfwImageHandling === 'BLUR'}>
		{#if isLemmyHosted}
			<source srcset="{src}?format=webp{size}" type="image/webp" />
			<source srcset={src} />
			<source srcset="{src}?format=jpg{size}" type="image/jpeg" />
		{/if}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<img
			{src}
			alt=""
			loading={lazy ? 'lazy' : 'eager'}
			title=""
			style=""
			on:click={toggleSize}
			on:error={imageLoadError}
		/>
	</picture>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { getSettingsContext } from './settings-context';
	export let src: string;
	export let mode: 'thumbnail' | 'full' = 'full';

	export let full = mode === 'full';
	export let nsfw = false;
	export let lazy = true;
	export let thumbnailResolution = 256;
	const { nsfwImageHandling } = getSettingsContext();

	$: valid = src.startsWith('https://') || src.startsWith('http://');
	$: isLemmyHosted = safeUrl(src)?.pathname.startsWith('/pictrs/');

	function safeUrl(url: string) {
		try {
			return new URL(url);
		} catch (e) {
			return null;
		}
	}

	let error = false,
		showAnyway = false;

	$: size = mode === 'thumbnail' ? `&thumbnail=${thumbnailResolution}` : '';

	function toggleSize() {
		if (mode === 'full') {
			full = !full;
		}
	}

	function imageLoadError() {
		error = true;
	}
</script>
