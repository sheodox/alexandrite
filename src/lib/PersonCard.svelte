<style>
	.icon {
		height: 2.4rem;
		width: 2.4rem;
		border-radius: 10rem;
		overflow: hidden;
		border: 3px solid var(--sx-gray-200);
		flex-shrink: 0;
	}
	.icon :global(img) {
		object-fit: cover;
	}
	.user-address {
		align-self: start;
	}
</style>

<div class="p-2">
	<div class="card p-4 f-column gap-2">
		<Stack dir="r" align="center" cl="card-title" gap={2}>
			<div class="icon f-row align-items-center justify-content-center">
				{#if personView.person.avatar && $profile.settings.show_avatars}
					<Image src={personView.person.avatar} mode="thumbnail" />
				{:else}
					<Icon icon="user" />
				{/if}
			</div>
			<a href="/{$profile.instance}/u/{nameAtInstance(personView.person)}" class="inline-link">
				<NameAtInstance place={personView.person} displayName={personView.person.display_name} prefix="" />
			</a>
		</Stack>

		<div class="user-address">
			<CopyableText text={userAddress} />
		</div>

		<div class="card-body p-0">
			<ul class="sx-list">
				<UserCounts {personView} />
			</ul>
		</div>
	</div>
</div>

<script lang="ts">
	import { Stack, Icon } from 'sheodox-ui';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import Image from '$lib/Image.svelte';
	import { nameAtInstance } from '$lib/nav-utils';
	import type { PersonView } from 'lemmy-js-client';
	import UserCounts from './UserCounts.svelte';
	import { profile } from './profiles/profiles';
	import CopyableText from './CopyableText.svelte';

	export let personView: PersonView;
	$: userAddress = '@' + nameAtInstance(personView.person, '', { alwaysShowInstance: true });
</script>
