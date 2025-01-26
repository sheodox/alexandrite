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
	}
</style>

<p class="copyable-text m-0 px-4 py-2 f-row align-items-center gap-2">
	<span class="text-preview">{text}</span>
	<IconButton icon="copy" text="Copy" small on:click={() => copyToClipboard(text)} />
</p>

<script lang="ts">
	import IconButton from './IconButton.svelte';
	import { copyToClipboard } from './utils';

	export let text: string;
</script>
