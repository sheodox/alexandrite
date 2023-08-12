<style lang="scss">
	video {
		max-width: 100%;
		max-height: 95vh;
	}
	.video-mode-full:not(.video-full) video {
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
	.video-mode-thumbnail.blur:not(:hover) video {
		filter: blur(10px);
	}
	video {
		width: 100%;
	}
</style>

{#if error}
	<div
		class="error align-items-center justify-content-center f-row"
		title="Video load failed"
		style={loadingHeight ? `height: ${loadingHeight};` : ''}
	>
		<Icon icon="bug" />
	</div>
{:else if nsfw && $nsfwImageHandling === 'HIDE' && !showAnyway}
	<button class="img show-nsfw" on:click|stopPropagation={() => (showAnyway = true)}>Show NSFW</button>
{:else if valid}
	<!-- svelte-ignore a11y-media-has-caption -->
	<video
		class="video-mode-{mode} {full ? 'video-full' : ''}"
		class:blur={nsfw && $nsfwImageHandling === 'BLUR'}
		on:error={videoLoadError}
		controls
	>
		<source src={src} />
		<a href="{link}">{linkTitle}</a>
	</video>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { getSettingsContext } from './settings-context';
	export let src: string;
	export let link: string;
	export let linkTitle: string;
	export let mode: 'thumbnail' | 'full' = 'full';

	export let full = mode === 'full';
	export let nsfw = false;
	// if the video is loading for the first time, this is a placeholder size we could use
	export let loadingHeight: string | undefined = undefined;
	const { nsfwImageHandling } = getSettingsContext();

	$: valid = src.startsWith('https://') || src.startsWith('http://');

	let error = false,
		showAnyway = false;

	function videoLoadError() {
		error = true;
	}
</script>
