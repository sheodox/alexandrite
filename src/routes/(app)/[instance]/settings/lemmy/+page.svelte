<style>
	form {
		width: 40rem;
		max-width: 100%;
	}
</style>

<form bind:this={settingsForm}>
	<Stack dir="c" gap={4}>
		<TextInput name="display_name" value={data.person.display_name ?? ''}>Display Name</TextInput>
		<MarkdownEditor label="Bio" name="bio" value={data.person.bio ?? ''} required={false} />
		<TextInput name="email" value={data.localUser.email ?? ''}>Email</TextInput>
		<TextInput name="matrix_user_id" value={data.person.matrix_user_id ?? ''}>Matrix User</TextInput>
		<ImageInput
			label="Avatar"
			showCurrentUpload={avatarUrl === data.person.avatar}
			bind:currentUploadUrl={avatarUrl}
			name="avatar"
		/>
		<ImageInput
			label="Banner"
			showCurrentUpload={bannerUrl === data.person.banner}
			bind:currentUploadUrl={bannerUrl}
			name="banner"
		/>
		<!-- interface language, need to localize alexandrite! -->
		<LanguageSettings bind:selected={discussionLanguages} languages={data.languages} />

		<Stack dir="r" gap={2}>
			<Select name="default_listing_type" value={data.localUser.default_listing_type} label="Default Listing">
				{#each ListingOptions(true) as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</Select>
			<Select label="Default Sort" value={data.localUser.default_sort_type} name="default_sort_type">
				{#each PostSortOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</Select>
		</Stack>

		<Checkbox name="show_nsfw" checked={data.localUser.show_nsfw}>Show NSFW content</Checkbox>
		<Checkbox name="show_scores" checked={data.localUser.show_scores}>Show scores</Checkbox>
		<Checkbox name="show_avatars" checked={data.localUser.show_avatars}>Show avatars</Checkbox>
		<Checkbox name="bot_account" checked={data.person.bot_account}>Bot account</Checkbox>
		<Checkbox name="show_bot_accounts" checked={data.localUser.show_bot_accounts}>Show bot accounts</Checkbox>
		<Checkbox name="show_read_posts" checked={data.localUser.show_read_posts}>Show read posts</Checkbox>
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
	import { TextInput, Checkbox, Stack, Select, createAutoExpireToast } from 'sheodox-ui';
	import type { ListingType, SaveUserSettings, SortType } from 'lemmy-js-client';
	import MarkdownEditor from '$lib/MarkdownEditor.svelte';
	import { profile, updateProfileSettings } from '$lib/profiles/profiles';
	import LanguageSettings from './LanguageSettings.svelte';
	import ImageInput from '$lib/ImageInput.svelte';

	$: client = $profile.client;
	$: jwt = $profile.jwt;

	export let data;
	let discussionLanguages = data.discussionLanguages;

	let settingsForm: HTMLFormElement;

	let avatarUrl = data.person.avatar,
		bannerUrl = data.person.banner;

	$: formState = createStatefulForm(settingsForm, async (body) => {
		if (!jwt) {
			return;
		}

		const settings: SaveUserSettings = {
			display_name: body.display_name as string,
			email: body.email as string,
			bio: body.bio as string,
			matrix_user_id: body.matrix_user_id as string,
			default_listing_type: body.default_listing_type as ListingType,
			default_sort_type: body.default_sort_type as SortType,
			discussion_languages: discussionLanguages,
			show_nsfw: body.show_nsfw === 'on',
			show_scores: body.show_scores === 'on',
			show_avatars: body.show_avatars === 'on',
			bot_account: body.bot_account === 'on',
			show_bot_accounts: body.show_bot_accounts === 'on',
			show_read_posts: body.show_read_posts === 'on',
			send_notifications_to_email: body.send_notifications_to_email === 'on',
			avatar: body.avatar as string,
			banner: body.banner as string
		};

		await client.saveUserSettings(settings);

		createAutoExpireToast({
			message: 'Your settings have been saved.'
		});

		updateProfileSettings($profile.id, {
			...settings
		});
	});
</script>
