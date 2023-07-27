<Title title="Send Message" />
<Layout size="medium" cl="mt-6">
	<Stack gap={6} dir="c">
		{#if sent}
			<Alert variant="success">Message sent</Alert>
		{/if}
		<PrivateMessageCompose to={data.personView.person} on:sent={() => (sent = true)} />
	</Stack>
</Layout>

<script lang="ts">
	import { Layout, Alert, Stack } from 'sheodox-ui';
	import Title from '$lib/Title.svelte';
	import PrivateMessageCompose from '$lib/PrivateMessageCompose.svelte';
	export let data;

	let sent = false;
</script>
