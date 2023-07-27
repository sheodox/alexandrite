<style lang="scss">
	.profile {
		border-radius: 10px;
		&:hover {
			background: var(--sx-gray-transparent);
		}
	}
</style>

<div class="profile py-1 px-2">
	<Stack dir="c" gap={2}>
		<Stack dir="r" gap={2} justify="between" align="center">
			<Stack dir="r" gap={2} cl="sx-font-size-4" align="center">
				<Avatar src={profile.avatar} icon={profile.username ? 'user' : 'user-secret'} size="1em" />
				{#if profile.username}
					<strong>{profile.username}</strong>
				{:else}
					<span class="muted">Guest</span>
				{/if}
				{#if $instanceDefaultProfileId === profile.id}
					<Tooltip>
						<span slot="tooltip">Default for {profile.instance}</span>
						<span class="sx-badge-gray sx-font-size-2"><Icon icon="check" /> Default</span>
					</Tooltip>
				{/if}
			</Stack>

			<Stack dir="r" gap={2} align="center">
				<Tooltip>
					<span slot="tooltip">Defaults</span>
					<MenuButton triggerClasses="m-0">
						<span slot="trigger">
							<Icon icon="ellipsis-vertical" />
						</span>
						<ul slot="menu">
							<li>
								<button on:click={() => ($instanceDefaultProfileId = profile.id)}
									><Icon icon="check" /> Set Default for {profile.instance}</button
								>
							</li>
							<!-- don't let them remove the guest account -->
							{#if profile.username}
								<li>
									<button on:click={removeAccount}>
										<Icon icon="trash-can" /> Remove Account
									</button>
								</li>
							{/if}
						</ul>
					</MenuButton>
				</Tooltip>
				<button
					class="secondary f-row gap-2 justify-content-center m-0"
					on:click={() => dispatch('select', profile)}
					disabled={busy || $currentProfile.id === profile.id}
				>
					<Icon icon="right-to-bracket" />
					Login
				</button>
			</Stack>
		</Stack>
	</Stack>
</div>

<script lang="ts">
	import { Stack, Icon, MenuButton, Tooltip } from 'sheodox-ui';
	import {
		profile as currentProfile,
		instanceDefaultProfileId,
		logoutProfile,
		switchToInstanceDefaultProfile,
		type Profile
	} from '$lib/profiles/profiles';
	import Avatar from '$lib/Avatar.svelte';
	import { createEventDispatcher } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	const dispatch = createEventDispatcher<{ select: Profile }>();

	export let profile: Profile;
	export let busy: boolean;

	function removeAccount() {
		logoutProfile(profile.id);

		// if you remove the account you're logged in as, reload to continue as a guest, or default if another is set
		if ($currentProfile.id === profile.id) {
			switchToInstanceDefaultProfile();
			invalidateAll();
		}
	}
</script>
