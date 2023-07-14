{#if import.meta.env.MODE === 'development'}
	<Tooltip {placement}>
		<span slot="tooltip">{text}</span>
		<button on:click class:small>
			<Icon icon="scroll" />
			<span class="sr-only">{text}</span>
		</button>
	</Tooltip>
{/if}

<script lang="ts">
	import { Icon, Tooltip } from 'sheodox-ui';
	import type { Placement } from '@floating-ui/dom';

	export let text = 'Log This';
	export let small = true;
	//
	export let placement: Placement | undefined = undefined;
</script>
