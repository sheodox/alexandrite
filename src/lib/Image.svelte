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
	.image-mode-full.blur {
		// need to do this otherwise the blur overflows its container and goes all over the card
		display: block;
		overflow: hidden;

		&:not(:hover) img {
			filter: blur(40px);
		}
	}
	img {
		width: 100%;
	}
	.unknown-size {
		object-fit: cover;
	}
</style>

{#if error}
	<div
		class="error align-items-center justify-content-center f-row"
		title="Image load failed"
		style={loadingHeight ? `height: ${loadingHeight};` : ''}
	>
		<Icon icon="bug" />
	</div>
{:else if nsfw && $nsfwImageHandling === 'HIDE' && !showAnyway}
	<button class="img show-nsfw" on:click|stopPropagation={() => (showAnyway = true)}>Show NSFW</button>
{:else if valid}
	<picture class="image-mode-{mode} {full ? 'image-full' : ''}" class:blur={nsfw && $nsfwImageHandling === 'BLUR'}>
		{#if isLemmyHosted}
			{#if $loadImagesAsWebp}
				<source srcset="{src}?format=webp{size}" type="image/webp" />
			{/if}
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
			style={imageStyle}
			on:click={toggleSize}
			on:error={imageLoadError}
			on:load={onLoad}
			class:unknown-size={loadingHeight && !aspect}
			bind:naturalWidth
			bind:naturalHeight
		/>
	</picture>
{/if}

<script lang="ts" context="module">
	// TODO maybe move this to context somewhere, it could be a very slow memory leak to cache
	// every image's aspect ratio indefinitely, but it's probably not going to
	const imageAspects: Record<string, number> = {};
</script>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { getSettingsContext } from './settings-context';
	export let src: string;
	export let mode: 'thumbnail' | 'full' = 'full';

	export let full = mode === 'full';
	export let resizable = true;
	export let nsfw = false;
	export let lazy = true;
	export let thumbnailResolution = 256;
	// if the image is loading for the first time, this is a placeholder size we could use
	export let loadingHeight: string | undefined = undefined;
	const { nsfwImageHandling, loadImagesAsWebp } = getSettingsContext();

	$: imageStyle = [
		aspect ? `display: block; aspect-ratio: ${aspect};` : '',
		// only use the loadingHeight if we don't know it's final dimensions already
		!aspect && loading && loadingHeight ? `height: ${loadingHeight}` : ''
	]
		.filter((style) => !!style)
		.join('; ');

	// cache image dimensions, so if it's culled from a virtual feed and re-inserted later
	// we can still position an element with the same dimensions so scrolling doesn't jump
	// around as the image takes a moment to load
	let loading = true;
	let aspectKey = [src, mode, full, resizable, nsfw, lazy, thumbnailResolution].join('-');
	let aspect = imageAspects[aspectKey] ?? 0;
	let naturalHeight: number;
	let naturalWidth: number;

	$: if (naturalHeight && naturalWidth) {
		imageAspects[aspectKey] = naturalWidth / naturalHeight;
	}

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

	function onLoad() {
		loading = false;
	}

	function toggleSize() {
		if (mode === 'full' && resizable) {
			full = !full;
		}
	}

	function imageLoadError() {
		error = true;
	}
</script>
