{#if import.meta.env.MODE === 'development'}
	<Tooltip>
		<span slot="tooltip">{text}</span>
		<button on:click class:small use:ripple class="m-0">
			<Icon icon="scroll" />
			<span class="sr-only">{text}</span>
		</button>
	</Tooltip>
{/if}

<script lang="ts">
	import { Icon, Tooltip, ripple } from 'sheodox-ui';

	export let text = 'Log This';
	export let small = true;
</script>
