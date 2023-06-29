<style>
	p,
	h1 {
		margin: 0;
	}
	p {
		font-size: var(--sx-font-size-5);
	}
</style>

<Header slim={false} appName="sx-lemmy" />

<Stack dir="c" justify="center" align="center" cl="f-1" gap={4}>
	<h1>Error</h1>
	<p>Sorry, something went wrong.</p>
	<p><code>{$page.error?.message}</code></p>

	<button on:click={() => location.reload()} class="secondary"> Reload </button>
</Stack>

<script lang="ts">
	import { page } from '$app/stores';
	import { Header, Stack } from 'sheodox-ui';
</script>
