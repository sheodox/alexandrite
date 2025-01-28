<style lang="scss">
	.copyable-text {
		background: var(--sx-gray-transparent-dark);
		align-self: start;
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid var(--sx-gray-transparent-light);
	}
	.text-preview {
		font-family: monospace, sans-serif;
		cursor: pointer;
	}
</style>

<p class="copyable-text m-0 px-4 py-2 f-row align-items-center gap-2" bind:this={el}>
	<!-- ignoring warnings because there's a button for accessibility, but people will want to click the text too -->
	<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
	<span class="text-preview" on:click={copy}>{text}</span>
	<IconButton icon="copy" text="Copy" small on:click={copy} />
</p>

<script lang="ts">
	import IconButton from './IconButton.svelte';
	import { copyToClipboard } from './utils';

	export let text: string;

	let el: HTMLParagraphElement;

	function copy() {
		copyToClipboard(text);
		el.animate(
			[
				{
					background: 'var(--sx-gray-transparent)'
				},
				{
					background: 'var(--sx-gray-dark)'
				}
			],
			{
				duration: 200
			}
		);
	}
</script>
