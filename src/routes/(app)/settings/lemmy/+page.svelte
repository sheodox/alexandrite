<style>
	form {
		width: 40rem;
		max-width: 100%;
	}
</style>

<form bind:this={settingsForm}>
	<Stack dir="c" gap={2}>
		<TextInput name="display_name" value={data.person.display_name ?? ''}>Display Name</TextInput>
		<!-- bio -->
		<TextInput name="email" value={data.localUser.email ?? ''}>Email</TextInput>
		<TextInput name="matrix_user_id" value={data.person.matrix_user_id ?? ''}>Matrix User</TextInput>
		<!-- avatar -->
		<!-- banner -->
		<!-- interface language, need to localize alexandrite! -->
		<!-- languages -->

		<Stack dir="r" gap={2}>
			<Fieldset legend="Default Listing" fieldsetClasses="m-0">
				<ToggleGroup
					options={ListingOptions(true)}
					name="default_listing_type"
					selected={data.localUser.default_listing_type}
				/>
			</Fieldset>
			<Fieldset legend="Default Sort" fieldsetClasses="m-0">
				<select aria-label="Default Sort" value={data.localUser.default_sort_type} name="default_sort_type">
					{#each PostSortOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</Fieldset>
		</Stack>

		<Checkbox name="show_nsfw" checked={data.localUser.show_nsfw}>Show NSFW content</Checkbox>
		<Checkbox name="show_scores" checked={data.localUser.show_scores}>Show scores</Checkbox>
		<Checkbox name="show_avatars" checked={data.localUser.show_avatars}>Show avatars</Checkbox>
		<Checkbox name="bot_account" checked={data.person.bot_account}>Bot account</Checkbox>
		<Checkbox name="show_bot_accounts" checked={data.localUser.show_bot_accounts}>Show bot accounts</Checkbox>
		<Checkbox name="show_read_posts" checked={data.localUser.show_read_posts}>Show read posts</Checkbox>
		<Checkbox name="show_new_post_notifs" checked={data.localUser.show_new_post_notifs}
			>Show notifications for new posts</Checkbox
		>
		<Checkbox name="send_notifications_to_email" checked={data.localUser.send_notifications_to_email}
			>Send notifications to email</Checkbox
		>
		<!-- 2fa setup? -->

		<BusyButton busy={$formState.busy} cl="primary">Save</BusyButton>
	</Stack>
</form>

<script lang="ts">
	import { ListingOptions, PostSortOptions } from '$lib/feed-filters';
	import BusyButton from '$lib/BusyButton.svelte';
	import { createStatefulForm } from '$lib/utils';
	import { TextInput, Checkbox, Fieldset, Stack, createAutoExpireToast } from 'sheodox-ui';
	import ToggleGroup from '$lib/ToggleGroup.svelte';
	import { getLemmyClient } from '$lib/lemmy-client.js';
	import type { ListingType, SortType } from 'lemmy-js-client';
	import { setLemmySettings } from '$lib/lemmy-settings.js';

	const { client, jwt } = getLemmyClient();

	export let data;

	let settingsForm: HTMLFormElement;

	$: formState = createStatefulForm(settingsForm, async (body) => {
		if (!jwt) {
			return;
		}

		const settings = {
			auth: jwt,
			display_name: body.display_name as string,
			email: body.email as string,
			matrix_user_id: body.matrix_user_id as string,
			default_listing_type: body.default_listing_type as ListingType,
			default_sort_type: body.default_sort_type as SortType,
			show_nsfw: body.show_nsfw === 'on',
			show_scores: body.show_scores === 'on',
			show_avatars: body.show_avatars === 'on',
			bot_account: body.bot_account === 'on',
			show_bot_accounts: body.show_bot_accounts === 'on',
			show_read_posts: body.show_read_posts === 'on',
			show_new_post_notifs: body.show_new_post_notifs === 'on',
			send_notifications_to_email: body.send_notifications_to_email === 'on'
		};

		await client.saveUserSettings(settings);

		createAutoExpireToast({
			title: 'Saved',
			message: 'Your settings have been saved.'
		});

		setLemmySettings({
			...data.localUser,
			...settings
		});
	});
</script>
