<style lang="scss">
	.profile-selector {
		width: 30rem;
		max-width: 100%;
		border-radius: 20px;
	}
</style>

<Modal bind:visible title="Switch Account">
	<div class="modal-body f-column align-items-center justify-content-center f-1">
		<div class="profile-selector">
			<Stack dir="c" gap={2}>
				<p class="m-0">Login to <strong>{$instance}</strong> as...</p>
				{#each instanceProfiles as profile, index}
					<ManageProfile
						{profile}
						on:select={() => $selectProfileState.submit(profile)}
						busy={$selectProfileState.busy}
					/>
					{#if index < instanceProfiles.length - 1}
						<hr class="w-100" />
					{/if}
				{/each}
				<a href="/instance?instance={$instance}" class="inline-link text-align-center">Login as a different user</a>
			</Stack>
		</div>
	</div>
</Modal>

<script lang="ts">
	import { Stack, Modal } from 'sheodox-ui';
	import { instance, profiles, setProfile, type Profile, getFallbackProfile } from './profiles';
	import { invalidateAll } from '$app/navigation';
	import ManageProfile from './ManageProfile.svelte';
	import { createStatefulAction } from '$lib/utils';
	import { config } from '$lib/config';

	export let visible: boolean;

	$: instanceProfiles = [
		getFallbackProfile(),
		...$profiles.filter((profile) => {
			if (config.forcedInstance) {
				return $instance === config.forcedInstance && profile.instance === $instance;
			}

			// same instance, no guests (it's in fallback)
			return profile.instance === $instance && profile.username;
		})
	];

	const selectProfileState = createStatefulAction(async (profile: Profile) => {
		setProfile(profile);

		visible = false;
		invalidateAll();
	});
</script>
