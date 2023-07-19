<style>
	.report {
		width: 40rem;
		background: var(--sx-gray-transparent);
		border-radius: 5px;
	}
</style>

<div class="report p-2">
	<Stack dir="c" gap={2}>
		<div class="f-row align-items-center gap-1">
			<Stack dir="r" gap={1} align="center" cl="f-1">
				Report by <UserLink user={creator} /><UserBadges user={creator} {bannedFromCommunity} />
			</Stack>
			<Stack dir="r" gap={2} align="center">
				{#if !$bannedUsers.has(creator.id)}
					<span class="sx-badge-gray">Unsure if banned.</span>
				{/if}
				<BanButton
					banned={bannedFromCommunity}
					personId={creator.id}
					{communityId}
					on:ban
					personName={creator.display_name || creator.name}
				/>
			</Stack>
		</div>
		<p class="m-0">
			<span class="muted fw-bold">Reason:</span>
			{reason}
		</p>
		<Stack dir="r" justify="start" align="center" gap={2}>
			<BusyButton
				cl="m-0 {resolved ? 'tertiary' : 'primary'}"
				on:click={() => dispatch('resolve', !resolved)}
				{busy}
				icon="circle-check"
				iconVariant={resolved ? 'regular' : 'solid'}
			>
				{#if resolved}
					Resolved
				{:else}
					Resolve
				{/if}
			</BusyButton>
			{#if resolver}
				<div class="f-row gap-1">
					{resolved ? 'Resolved' : 'Unresolved'} by <UserLink user={resolver} />
				</div>
			{/if}
		</Stack>
	</Stack>
</div>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import BusyButton from '$lib/BusyButton.svelte';
	import BanButton from './BanButton.svelte';
	import UserLink from '$lib/UserLink.svelte';
	import UserBadges from '$lib/feeds/posts/UserBadges.svelte';
	import type { Person } from 'lemmy-js-client';
	import { createEventDispatcher } from 'svelte';
	import { getBannedUsersStore } from './banned-users-context';

	const dispatch = createEventDispatcher<{ resolve: boolean }>();
	const bannedUsers = getBannedUsersStore();

	export let resolver: Person | undefined;
	export let resolved: boolean;
	export let communityId: number;
	export let creator: Person;
	export let reason: string;
	export let busy: boolean;
	$: bannedFromCommunity = $bannedUsers.get(creator.id) ?? false;
</script>
