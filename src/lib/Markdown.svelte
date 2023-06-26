<style>
	div :global(img) {
		max-width: 100%;
		cursor: zoom-out;
	}
	div :global(img:not(.show-full)) {
		max-height: 40rem;
		cursor: zoom-in;
	}
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="markdown-renderer has-inline-links" on:click={toggleFullSize}>
	{@html rendered}
</div>

<script lang="ts">
	import MarkdownIt from 'markdown-it';
	const parser = new MarkdownIt();
	export let md: string;
	$: rendered = parser.render(md);

	function toggleFullSize(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName.toLowerCase() === 'img') {
			target.classList.toggle('show-full');
		}
	}
</script>
