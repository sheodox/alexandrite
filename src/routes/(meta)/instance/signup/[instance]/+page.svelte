<style>
	.dn {
		display: none;
	}

	img {
		width: 20rem;
	}
</style>

<Title title="Create Account" />

<a href="/instance" class="inline-link"><Icon icon="chevron-left" /> Return to Login Page</a>
<h1 class="m-0 sx-font-size-9">Create Account</h1>

{#if registrationMode === 'Closed'}
	<p>Registrations are closed for <strong>{siteName}</strong>.</p>
{:else}
	<form bind:this={registerForm}>
		<Stack dir="c" gap={4} cl="has-inline-links">
			<p class="m-0">
				You're creating an account on <ExternalLink cl="inline-link" href={data.instanceUrl}>{siteName}</ExternalLink>.
			</p>
			<TextInput
				name="username"
				bind:value={username}
				required
				minlength={3}
				pattern="[a-zA-Z0-9_]+"
				placeholder="letters, numbers, or underscore">Username</TextInput
			>
			<TextInput name="email" bind:value={email} required={requireEmailVerification} type="email"
				>Email ({requireEmailVerification ? 'Required' : 'Optional'})</TextInput
			>
			<TextInput name="password" bind:value={password} type="password" required minlength={10} maxlength={60}
				>Password</TextInput
			>
			<TextInput
				name="password_verify"
				bind:value={passwordVerify}
				type="password"
				required
				minlength={10}
				maxlength={60}>Verify Password</TextInput
			>
			<div class="ml-1">
				<Checkbox name="show_nsfw" bind:checked={showNsfw}>Show NSFW Content</Checkbox>
			</div>
			{#if applicationQuestion && registrationMode === 'RequireApplication'}
				<Alert variant="warning"
					>To join this server, you need to fill out this application and wait to be accepted.</Alert
				>
				<Markdown md={applicationQuestion} />

				<MarkdownEditor bind:value={answer} label="Application Answer" name="answer" />
			{/if}
			{#if captcha?.ok}
				<Fieldset legend="Captcha">
					<Stack dir="c" gap={4}>
						<img src="data:image/png;base64,{captcha.ok.png}" alt="captcha" />
						<Stack dir="r" gap={2}>
							{#if captchaAudioSrc}
								<audio src={captchaAudioSrc} controls />
							{/if}
							<BusyButton
								on:click={() => $captchaState.submit()}
								type="button"
								cl="tertiary"
								busy={$captchaState.busy}
								icon="arrows-rotate">New Captcha</BusyButton
							>
						</Stack>

						<TextInput name="captcha_answer" bind:value={captchaAnswer} required>Enter Code</TextInput>
					</Stack>
				</Fieldset>
			{/if}
			<input name="honeypot" class="dn" bind:value={honeypot} />
			<BusyButton busy={$registerState.busy} cl="primary">{privateInstance ? 'Apply to Join' : 'Sign Up'}</BusyButton>
		</Stack>
	</form>
{/if}

<script lang="ts">
	import Markdown from '$lib/Markdown.svelte';
	import { Alert, Icon, ExternalLink, Stack, Fieldset, TextInput, Checkbox, createAutoExpireToast } from 'sheodox-ui';
	import Title from '$lib/Title.svelte';
	import { onMount } from 'svelte';
	import BusyButton from '$lib/BusyButton.svelte';
	import type { GetCaptchaResponse } from 'lemmy-js-client';
	import { createStatefulAction, createStatefulForm } from '$lib/utils.js';
	import MarkdownEditor from '$lib/MarkdownEditor.svelte';
	import { goto } from '$app/navigation';

	export let data;
	let registerForm: HTMLFormElement;

	$: applicationQuestion = data.siteMeta.site_view.local_site.application_question;
	$: registrationMode = data.siteMeta.site_view.local_site.registration_mode;
	$: siteName = data.siteMeta.site_view.site.name;
	$: requireEmailVerification = data.siteMeta.site_view.local_site.require_email_verification;
	$: requireCaptcha = data.siteMeta.site_view.local_site.captcha_enabled;
	$: privateInstance = data.siteMeta.site_view.local_site.private_instance;

	let username = '',
		email = '',
		password = '',
		passwordVerify = '',
		captchaAnswer = '',
		answer = '',
		honeypot = '',
		showNsfw = false,
		captcha: GetCaptchaResponse | null = null;

	$: captchaState = createStatefulAction<void>(async () => {
		captcha = requireCaptcha ? await data.client.getCaptcha() : null;
	});

	$: captchaAudioSrc = captcha?.ok?.wav ? `data:audio/wav;base64,${captcha.ok.wav}` : '';

	// some things like email need to be undefined if blank
	function optionalString(str: string) {
		return str ? str : undefined;
	}

	$: registerState = createStatefulForm(registerForm, async () => {
		try {
			const res = await data.client.register({
				answer,
				captcha_answer: optionalString(captchaAnswer),
				captcha_uuid: captcha?.ok?.uuid,
				email: optionalString(email),
				honeypot,
				password,
				password_verify: passwordVerify,
				show_nsfw: showNsfw,
				username
			});

			if (res.registration_created) {
				createAutoExpireToast({
					variant: 'success',
					message: 'Registration created'
				});
			}

			if (res.verify_email_sent) {
				createAutoExpireToast({
					variant: 'info',
					message: `A verification email was sent, check ${email}.`
				});
			}

			goto('/instance');
		} catch (e) {
			// get a new captcha, i think they're single use
			captchaAnswer = '';
			$captchaState.submit();

			// still let the state handle this
			throw e;
		}
	});

	onMount(async () => {
		if (!data.siteMeta.site_view.local_site.captcha_enabled) {
			return;
		}
		$captchaState.submit();
	});
</script>
