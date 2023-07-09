<style>
	div :global(img) {
		max-width: 100%;
		cursor: zoom-out;
	}
	div :global(img:not(.show-full)) {
		max-height: 40rem;
		cursor: zoom-in;
	}

	div :global(code) {
		word-wrap: break-word;
		white-space: pre-wrap;
	}
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="markdown-renderer has-inline-links" on:click={toggleFullSize}>
	{@html rendered}
</div>

<script lang="ts">
	import MarkdownIt, { type Options } from 'markdown-it';
	const mdOptions: Options = {
		linkify: true,
		html: false,
		typographer: true
	};

	const communityReg = /([\w]+@[\w]+(\.[\w]+)+)/g;

	const fullRender = new MarkdownIt(mdOptions);
	const noImageRender = new MarkdownIt(mdOptions).disable('image');

	extendMd(fullRender);
	extendMd(noImageRender);

	function extendMd(md: MarkdownIt) {
		md.linkify.set({ fuzzyEmail: false });
		// linkify community links in the format: !communityname@example.com
		md.linkify.add('!', {
			validate: function (text, pos) {
				const tail = text.slice(pos);
				const match = tail.match(communityReg);
				if (match) {
					return match[0].length;
				}

				return 0;
			},
			normalize: function (match) {
				match.url = `/c/${match.url.replace('!', '')}`;
			}
		});
	}

	export let md: string;
	export let noImages = false;

	$: rendered = noImages ? noImageRender.render(md) : fullRender.render(md);

	function toggleFullSize(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName.toLowerCase() === 'img') {
			target.classList.toggle('show-full');
		}
	}
</script>
