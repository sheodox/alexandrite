<Header slim={false} appName="Alexandrite" href="/">
	<Logo slot="logo" size="large" />
</Header>

<slot />

<script lang="ts">
	import Logo from '$lib/Logo.svelte';
	import { Header } from 'sheodox-ui';
</script>
