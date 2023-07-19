<Tooltip {placement}>
	<span slot="tooltip">{text}</span>
	<button
		class="f-row align-items-center justify-content-center gap-2 {cl}"
		on:click
		class:small
		disabled={disabled || busy}
		aria-pressed={pressed}
		{type}
		use:ripple
	>
		{#if busy}
			<Spinner />
		{:else}
			<Icon {icon} {variant} />
			<span class="sr-only">{text}</span>
		{/if}
		<slot />
	</button>
</Tooltip>

<script lang="ts">
	import { Tooltip, Icon, ripple } from 'sheodox-ui';
	import Spinner from './Spinner.svelte';
	import type { Placement } from '@floating-ui/dom';

	export let small = false;
	export let disabled = false;
	export let busy = false;
	export let text = '';
	export let cl = '';
	export let placement: Placement | undefined = undefined;
	export let icon: string;
	export let variant: 'regular' | 'solid' = 'solid';
	export let pressed = false;
	export let type: 'submit' | 'button' | 'reset' | null | undefined = 'submit';
</script>
