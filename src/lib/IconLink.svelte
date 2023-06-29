<Tooltip {placement}>
	<span slot="tooltip">{text}</span>
	<a {href} on:click class:small class="button {cl}">
		<Icon {icon} variant="icon-only" />
		<span class="sr-only">{text}</span>
		<slot />
	</a>
</Tooltip>

<script lang="ts">
	import { Tooltip, Icon } from 'sheodox-ui';
	import type { Placement } from '@floating-ui/dom';

	export let small = false;
	export let text = '';
	export let cl = '';
	export let placement: Placement | undefined = undefined;
	export let icon: string;
	export let href: string;
</script>
