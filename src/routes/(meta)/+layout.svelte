<style>
	:root {
		--sx-hue-gray: 280 !important;
	}
</style>

<Toasts />

<Header slim={false} appName="Alexandrite" href="/">
	<Logo slot="logo" size="large" />
</Header>

<slot />

<script lang="ts">
	import Logo from '$lib/Logo.svelte';
	import { Header, Toasts } from 'sheodox-ui';
</script>
