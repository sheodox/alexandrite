<style>
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
</style>

{#if error}
	<div class="error align-items-center justify-content-center f-row" title="Image load failed">
		<Icon icon="bug" />
	</div>
{:else if valid}
	<picture class="image-mode-{mode} {full ? 'image-full' : ''}">
		<source srcset="{src}?format=webp{size}" type="image/webp" />
		<source srcset={src} />
		<source srcset="{src}?format=jpg{size}" type="image/jpeg" />
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<img {src} alt="" loading="lazy" title="" style="" on:click={toggleSize} on:error={imageLoadError} />
	</picture>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	export let src: string;
	export let mode: 'thumbnail' | 'full' = 'full';

	export let full = mode === 'full';

	$: valid = src.startsWith('https://') || src.startsWith('http://');

	let error = false,
		loadAttempts = 0;

	const AUTO_LOAD_ATTEMPTS_MAX = 4;

	$: size = mode === 'thumbnail' ? `&thumbnail=256` : '';

	function toggleSize() {
		if (mode === 'full') {
			full = !full;
		}
	}

	function imageLoadError() {
		error = true;

		// give up eventually
		if (loadAttempts >= AUTO_LOAD_ATTEMPTS_MAX) {
			return;
		}

		// retry a bit later, with random times to not spam retries on every image at once
		setTimeout(() => {
			loadAttempts++;
			error = false;
		}, 1000 * (loadAttempts + 1) + Math.random() * 3000);
	}
</script>
