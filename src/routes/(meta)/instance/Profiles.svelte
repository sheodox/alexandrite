<style>
	button {
		margin: 0;
	}
</style>

{#if $profiles.length}
	<Accordion open>
		<span slot="title">Accounts</span>
		<Stack dir="c" gap={4} cl="p-4">
			<Stack dir="r" gap={2} align="center" justify="center">
				<label for="default-instance" class="fw-bold"> Default Instance </label>
				<select bind:value={$defaultInstance} id="default-instance" class="f-1">
					{#each instances as instance}
						<option value={instance}>{instance}</option>
					{/each}
				</select>
			</Stack>
			{#each alphabetizedProfiles as profile}
				<Stack dir="r" gap={1}>
					<button
						class="tertiary f-1 f-row gap-2 align-items-center"
						on:click={() => $selectProfileState.submit(profile)}
						disabled={$selectProfileState.busy}
					>
						<Avatar src={profile.avatar} icon={profile.username ? 'user' : 'user-secret'} size="1em" />
						{profile.username ? profile.username + '@' : ''}{profile.instance}</button
					>
					<IconButton
						text="Remove Account"
						icon="times"
						on:click={() => logoutProfile(profile.id)}
						disabled={$selectProfileState.busy}
					/>
				</Stack>
			{/each}
		</Stack>
	</Accordion>
{/if}

<script lang="ts">
	import {
		profiles,
		defaultInstance,
		logoutProfile,
		setDefaultProfile,
		type Profile,
		setProfile
	} from '$lib/profiles/profiles';
	import { Accordion, Stack } from 'sheodox-ui';
	import Avatar from '$lib/Avatar.svelte';
	import IconButton from '$lib/IconButton.svelte';
	import { goto } from '$app/navigation';
	import { createStatefulAction } from '$lib/utils';

	$: alphabetizedProfiles = [...$profiles].sort((a, b) => {
		return a.id.localeCompare(b.id);
	});

	$: instances = Array.from(new Set($profiles.map((p) => p.instance)));

	const selectProfileState = createStatefulAction<Profile>(async (p) => {
		setDefaultProfile(p.id);
		setProfile(p);
		await goto(`/${p.instance}`);
	});
</script>
