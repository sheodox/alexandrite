{#if profiles.length}
	<Accordion open>
		<span slot="title">Accounts</span>
		<Stack dir="c" gap={2}>
			{#each alphabetizedProfiles as profile}
				<Stack dir="r" gap={1}>
					<button class="secondary f-1 f-row gap-2" on:click={() => selectProfile(profile)} disabled={isRedirecting}>
						<Avatar src={profile.avatar} icon="user" size="1em" />
						{profile.username ? profile.username + '@' : ''}{profile.instance}</button
					>
					<IconButton text="Remove Account" icon="times" on:click={() => logout(profile.id)} />
				</Stack>
			{/each}
		</Stack>
	</Accordion>
{/if}

<script lang="ts">
	import {
		getProfilesFromStorage,
		logoutProfile,
		setDefaultProfile,
		type Profile,
		setProfile
	} from '$lib/profiles/profiles';
	import { Accordion, Stack } from 'sheodox-ui';
	import Avatar from '$lib/Avatar.svelte';
	import IconButton from '$lib/IconButton.svelte';
	import { goto } from '$app/navigation';

	let profiles = getProfilesFromStorage(),
		isRedirecting = false;

	$: alphabetizedProfiles = [...profiles].sort((a, b) => {
		return a.id.localeCompare(b.id);
	});

	function logout(id: string) {
		logoutProfile(id);
		profiles = getProfilesFromStorage();
	}

	async function selectProfile(p: Profile) {
		isRedirecting = true;
		setDefaultProfile(p.id);
		setProfile(p);
		try {
			await goto('/');
		} catch (e) {
			isRedirecting = false;
		}
	}
</script>
