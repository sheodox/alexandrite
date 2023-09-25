<style>
	.spinner {
		/* match the width of icons in dropdown menus from sheodox-ui */
		width: 1.5rem;
	}
</style>

{#if !action.hidden}
	{#if action.href}
		<a href={action.href} class="button m-0 ws-nowrap {cl}"><Icon icon={action.icon} {variant} /> {action.text}</a>
	{:else if action.click}
		<button
			on:click={action.click}
			class="button m-0 ws-nowrap {cl}"
			disabled={action.busy ?? action.disabled ?? false}
			use:ripple
		>
			<div class="f-row gap-1">
				{#if action.busy}
					<div class="spinner">
						<Spinner />
					</div>
				{:else}
					<Icon icon={action.icon} {variant} />
				{/if}
				<span>{action.text}</span>
			</div>
		</button>
	{/if}
{/if}

<script lang="ts">
	import type { ExtraAction } from './utils';
	import Spinner from './Spinner.svelte';
	import { Icon, ripple } from 'sheodox-ui';

	export let action: ExtraAction;
	export let cl = '';

	$: variant = action.variant || 'solid';
</script>
