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

<Title title="Login" />

<h1 class="m-0 sx-font-size-9">Welcome</h1>

<Stack dir="c" gap={4} cl="has-inline-links">
	{#if expired}
		<Alert variant="warning">You were logged out, please log in again.</Alert>
	{/if}
	<p>
		Alexandrite is a beautiful desktop-first alternative web UI for <ExternalLink href="https://join-lemmy.org/"
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
	<Icon icon="warning" /> Alexandrite is only compatible with instances running <code>0.18.1</code> or later.
</Alert>

<Profiles />

<form class:instance-valid={parseableInstance} on:submit|preventDefault={onSubmit}>
	<Stack gap={2}>
		{#if errMsg}
			<Alert variant="error">{errMsg}</Alert>
		{/if}
		<TextInput
			placeholder="Your chosen Lemmy website, e.g. lemmy.ml or lemmy.world"
			name="instance"
			bind:value={instance}>Instance</TextInput
		>

		<div class="login-inputs f-column gap-2">
			<Separator>Login Info (Optional)</Separator>
			<TextInput name="username" bind:value={username}>Username or email (optional)</TextInput>
			<TextInput name="password" bind:value={password} type="password" maxlength={60}>Password</TextInput>
			<TextInput name="totp_2fa_token" bind:value={totp_2fa_token}
				>Two-factor authentication token (if enabled)</TextInput
			>
		</div>
		<BusyButton
			cl="primary mt-6"
			disabled={!instance || !parseableInstance || (!!username && !password) || submitting}
			busy={submitting}
		>
			<span>{username ? 'Sign In' : `Use ${instanceNoProtocol || '???'}`}</span>
		</BusyButton>
	</Stack>
</form>

<a href="/about" class="text-align-center inline-link">About Alexandrite / Support Development</a>

<script lang="ts">
	import { Alert, Icon, TextInput, Stack, ExternalLink } from 'sheodox-ui';
	import BusyButton from '$lib/BusyButton.svelte';
	import Separator from '$lib/Separator.svelte';
	import Title from '$lib/Title.svelte';
	import { createLemmyClient } from '$lib/lemmy-client.js';
	import type { GetSiteResponse, Login } from 'lemmy-js-client';
	import Profiles from './Profiles.svelte';
	import { getMessageFromError } from '$lib/error-messages.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { addProfile } from '$lib/profiles/profiles';

	let errMsg = '';
	let expired = false;

	let submitting = false;

	const regUrlStart = /^https?:\/\//g;

	$: parseableInstance = parseableUrl(instance);
	$: instanceNoProtocol = instance.replace(regUrlStart, '');

	let instance = 'lemmy.world',
		username = '',
		password = '',
		totp_2fa_token = '';

	function parseableUrl(url: string) {
		const host = url.replace(regUrlStart, '');

		try {
			new URL('https://' + host);
			return /.\../.test(host);
		} catch (e) {
			return false;
		}
	}

	async function onSubmit() {
		submitting = true;
		await attemptLogin();
		submitting = false;
	}

	async function attemptLogin() {
		instance = instance.trim().replace(/^https:\/\//, '');
		username = username.trim();

		if (!instance) {
			errMsg = 'You must specify a Lemmy instance!';
			return;
		}

		const baseUrl = 'https://' + instance;

		const client = createLemmyClient(baseUrl);
		let site: GetSiteResponse;

		try {
			site = await client.getSite({});
		} catch (e) {
			errMsg = `Error connecting to "${instance}", check to make sure your instance is spelled correctly.`;
			return;
		}

		if (site.version.startsWith('0.17.') || site.version.startsWith('0.16.')) {
			errMsg = `Server version (${site.version}) is too low!`;
			return;
		}

		if (username) {
			const loginForm: Login = {
				username_or_email: username,
				password,
				totp_2fa_token: totp_2fa_token ? totp_2fa_token : undefined
			};

			let jwt = '';
			try {
				jwt = (await client.login(loginForm)).jwt ?? '';
			} catch (e) {
				errMsg = 'Login failed: ' + getMessageFromError(e);
				return;
			}

			const site = await client.getSite({
				auth: jwt
			});

			const user = site.my_user?.local_user_view;

			addProfile(instance, user?.person, jwt, user?.local_user);
		} else {
			addProfile(instance);
		}

		await goto(`/${instance}`);
	}

	onMount(() => {
		const u = new URL(location.href),
			instanceParam = u.searchParams.get('instance');
		expired = u.searchParams.get('expired') === 'true';

		if (instanceParam) {
			instance = instanceParam;
		}
	});
</script>
