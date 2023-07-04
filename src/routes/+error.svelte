<style>
	p,
	h1 {
		margin: 0;
	}
	p {
		font-size: var(--sx-font-size-5);
	}
	code {
		width: 30rem;
		max-width: 100%;
		display: block;
	}
	button {
		width: 12rem;
	}
</style>

<Header slim={false} appName="Alexandrite">
	<Logo slot="logo" size="large" />
</Header>

<Stack dir="c" justify="center" align="center" cl="f-1" gap={4}>
	<h1>Error</h1>
	<p>Sorry, something went wrong.</p>
	<p><code>{$page.error?.message}</code></p>

	<Stack gap={2} align="center" dir="r">
		<a href="/instance" class="inline-link">Try a different instance?</a>

		<button on:click={() => location.reload()} class="secondary"> Reload </button>
	</Stack>
</Stack>

<script lang="ts">
	import { page } from '$app/stores';
	import Logo from '$lib/Logo.svelte';
	import { Header, Stack } from 'sheodox-ui';
</script>
