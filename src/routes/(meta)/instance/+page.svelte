<h1>Welcome</h1>

<form action="?/setInstance" use:enhance method="POST">
	<Stack gap={2}>
		{#if form?.errorMsg}
			<Alert variant="error">{form.errorMsg}</Alert>
		{/if}
		<TextInput placeholder="lemmy.ml" name="instance" bind:value={instance}>Instance</TextInput>

		<TextInput name="username" bind:value={username}>Username or email (optional)</TextInput>
		<TextInput name="password" bind:value={password} type="password">Password</TextInput>

		<button class="primary" disabled={!instance || (!!username && !password)}>
			{username ? 'Sign In' : `Use ${instance || '???'}`}
		</button>
	</Stack>
</form>

<script lang="ts">
	import { Alert, TextInput, Stack } from 'sheodox-ui';
	import { enhance } from '$app/forms';

	export let form;
	export let data;

	let instance = form?.instance ?? data.settings.instance ?? 'lemmy.ml',
		username = form?.username ?? '',
		password = '';
</script>
