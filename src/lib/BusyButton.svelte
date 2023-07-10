<button class="f-row align-items-center gap-2 {cl}" disabled={busy || disabled}>
	{#if busy}
		<Spinner />
	{/if}
	<slot />
</button>

<script lang="ts">
	import Spinner from './Spinner.svelte';
	export let cl = '';
	export let busy = false;
	export let disabled = false;
</script>
