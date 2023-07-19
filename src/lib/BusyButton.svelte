<style>
	button {
		display: flex !important;
		position: relative;
		overflow: hidden;
	}
</style>

<button
	class="align-items-center justify-content-center gap-2 {cl}"
	disabled={busy || disabled}
	on:click
	{style}
	{type}
	class:small
	use:ripple
>
	{#if busy}
		<Spinner />
	{:else if icon}
		<Icon {icon} variant={iconVariant} />
	{/if}
	<slot />
</button>

<script lang="ts">
	import Spinner from './Spinner.svelte';
	import { Icon, ripple } from 'sheodox-ui';
	export let cl = '';
	export let style = '';
	export let busy = false;
	export let disabled = false;
	export let small = false;
	export let icon = '';
	export let iconVariant: 'solid' | 'regular' = 'solid';
	export let type: 'submit' | 'button' | 'reset' | null | undefined = 'submit';
</script>
