<Tooltip>
	<span slot="tooltip">{text}</span>
	<a {href} on:click class:small class="button {cl} ws-nowrap">
		<Icon {icon} {variant} />
		<span class="sr-only">{text}</span>
		<slot />
	</a>
</Tooltip>

<script lang="ts">
	import { Tooltip, Icon } from 'sheodox-ui';

	export let small = false;
	export let text = '';
	export let cl = '';
	export let icon: string;
	export let href: string;
	export let variant: 'regular' | 'solid' = 'solid';
</script>
