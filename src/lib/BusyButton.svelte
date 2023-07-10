<button class="f-row align-items-center justify-content-center gap-2 {cl}" disabled={busy || disabled} on:click {style}>
	{#if busy}
		<Spinner />
	{/if}
	<slot />
</button>

<script lang="ts">
	import Spinner from './Spinner.svelte';
	export let cl = '';
	export let style = '';
	export let busy = false;
	export let disabled = false;
</script>
