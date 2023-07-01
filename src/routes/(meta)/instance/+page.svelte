<style>
	p {
		margin: 0;
		font-size: var(--sx-font-size-4);
	}

	.login-inputs {
		opacity: 0.6;
	}

	.instance-valid .login-inputs {
		opacity: 1;
	}
</style>

<h1 class="m-0 sx-font-size-9">Welcome</h1>

<Stack dir="c" gap={4} cl="has-inline-links">
	<p>
		sx-lemmy is a beautiful desktop-first alternative web UI for <ExternalLink href="https://join-lemmy.org/"
			>Lemmy</ExternalLink
		>, a social link aggregator and discussion forum for the <ExternalLink
			href="https://simple.wikipedia.org/wiki/Fediverse">Fediverse</ExternalLink
		>.
	</p>
	<p>
		If you're new here, first <ExternalLink href="https://join-lemmy.org/instances"
			>find a Lemmy instance that sounds interesting to you</ExternalLink
		> then come back here.
	</p>
</Stack>

<Alert variant="info">
	<Icon icon="warning" /> sx-lemmy is only compatible with instances running <code>0.18.0</code> or later.
</Alert>

<form action="?/setInstance" method="POST" class:instance-valid={parseableInstance}>
	<Stack gap={2}>
		{#if form?.errorMsg}
			<Alert variant="error">{form.errorMsg}</Alert>
		{/if}
		<TextInput
			placeholder="Your chosen Lemmy website, e.g. lemmy.ml or lemmy.world"
			name="instance"
			bind:value={instance}>Instance</TextInput
		>

		<div class="login-inputs f-column gap-2">
			<Separator>Login Info (Optional)</Separator>
			<TextInput name="username" bind:value={username}>Username or email (optional)</TextInput>
			<TextInput name="password" bind:value={password} type="password">Password</TextInput>
		</div>
		<button class="primary mt-6" disabled={!instance || !parseableInstance || (!!username && !password)}>
			{username ? 'Sign In' : `Use ${instanceNoProtocol || '???'}`}
		</button>
	</Stack>
</form>

<script lang="ts">
	import { Alert, Icon, TextInput, Stack, ExternalLink } from 'sheodox-ui';
	import Separator from '$lib/Separator.svelte';

	export let form;
	export let data;

	const regUrlStart = /^https?:\/\//g;

	$: parseableInstance = parseableUrl(instance);
	$: instanceNoProtocol = instance.replace(regUrlStart, '');

	let instance = form?.instance || data.settings.instance || 'lemmy.ml',
		username = form?.username ?? '',
		password = '';

	function parseableUrl(url: string) {
		const host = url.replace(regUrlStart, '');
		console.log(url);

		try {
			new URL('https://' + host);
			return /.\../.test(host);
		} catch (e) {
			return false;
		}
		return true;
	}
</script>
