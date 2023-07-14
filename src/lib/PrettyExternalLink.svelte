{#if valid}
	<a class="inline-link {cl}" {href} rel="noreferrer" target="_blank"
		><Icon icon="arrow-up-right-from-square" /> {prettyUrl(href)}</a
	>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';

	export let href: string;
	export let cl = '';

	$: valid = /https?:\/\//.test(href);

	const ellipsis = '...',
		maxDisplayedPathLength = 10;

	function prettyUrl(href: string) {
		const u = new URL(href),
			ending = u.pathname + u.search + u.hash,
			endingAsCharacters = [...ending],
			shortened =
				endingAsCharacters.length > maxDisplayedPathLength
					? [...ending].slice(0, maxDisplayedPathLength - ellipsis.length).join('') + ellipsis
					: ending;

		return `${u.host}${shortened}`;
	}
</script>
