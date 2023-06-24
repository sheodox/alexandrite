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
	<div class="error align-items-center justify-content-center f-row">
		<button on:click={() => (error = false)}>
			<Icon icon="bug" />
			<span>Retry?</span>
		</button>
	</div>
{:else}
	<picture class="image-mode-{mode} {full ? 'image-full' : ''}">
		<source srcset="{src}?format=webp{size}" type="image/webp" />
		<source srcset={src} />
		<source srcset="{src}?format=jpg{size}" type="image/jpeg" />
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<img {src} alt="" loading="lazy" title="" style="" on:click={toggleSize} on:error={() => (error = true)} />
	</picture>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	export let src: string;
	export let mode: 'thumbnail' | 'full' = 'full';

	export let full = mode === 'full';

	let error = false;

	$: size = mode === 'thumbnail' ? `&thumbnail=256` : '';

	function toggleSize() {
		if (mode === 'full') {
			full = !full;
		}
	}
</script>
