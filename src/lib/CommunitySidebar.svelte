<style lang="scss">
	.community-address {
		align-self: start;
	}
</style>

<article>
	{#if community && communityView}
		<Sidebar description={community.description ?? ''} context="Community" bind:descriptionOpen={$descriptionOpen}>
			<a href={communityHref} slot="name">
				<NameAtInstance place={community} prefix="!" />
			</a>

			<div slot="actions">
				<Stack dir="c" gap={2}>
					{#if communityView}
						<CommunityCounts {communityView} />
					{/if}
					{#if communityAddress}
						<div class="community-address mb-4">
							<CopyableText text={communityAddress} />
						</div>
					{/if}
				</Stack>
			</div>
			<div slot="end">
				<Accordion bind:open={$communityDetailsOpen}>
					<span slot="title"><Icon icon="users" /> Community Details</span>
					<div class="f-column gap-2">
						<ul class="sx-list">
							{#each communityStats as stat}
								<li class="sx-list-item two-columns">
									<span class="column">{stat.label}</span>
									<span class="column text-align-right">{stat.value.toLocaleString()} <Icon icon={stat.icon} /></span>
								</li>
							{/each}
							<li class="sx-list-item">
								<ModlogLink
									communityId={community.id}
									highlight={userModerates ?? false}
									highlightColor="green"
									warn={warnModlog}
								/>
							</li>
							<li class="sx-list-item">
								<ExternalLink href={community.actor_id} cl="inline-link">
									<Icon icon="arrow-up-right-from-square" />
									View on {communityInstance}
								</ExternalLink>
							</li>
						</ul>

						{#if moderators}
							<Accordion>
								<span slot="title">Moderators</span>
								<Stack dir="c" gap={2}>
									<ul class="sx-list">
										{#each moderators as mod}
											<li class="sx-list-item">
												<ModeratorRow hasSeniority={hasModSeniority(moderators, mod.moderator.id)} {mod} />
											</li>
										{/each}
									</ul>
									{#if userModerates && !userIsHeadMod}
										<Stack dir="r" justify="end">
											<BusyButton small icon="user-minus" busy={$userModResignPending} on:click={resignFromModTeam}
												>Leave Mod Team</BusyButton
											>
										</Stack>
									{/if}
								</Stack>
							</Accordion>
						{/if}
					</div>
				</Accordion>
			</div>
		</Sidebar>
	{/if}
</article>

<script lang="ts">
	import { Stack, Icon, ExternalLink, Accordion } from 'sheodox-ui';
	import Sidebar from '$lib/Sidebar.svelte';
	import NameAtInstance from '$lib/NameAtInstance.svelte';
	import CommunityCounts from './CommunityCounts.svelte';
	import BusyButton from './BusyButton.svelte';
	import ModlogLink from './ModlogLink.svelte';
	import ModeratorRow from './mod-list/ModeratorRow.svelte';
	import { nameAtInstance } from './nav-utils';
	import { profile } from '$lib/profiles/profiles';
	import { getAppContext } from './app-context';
	import { getSettingsContext } from './settings-context';
	import { getCommunityContext } from './community-context/community-context';
	import { getModActionPending, getModContext } from './mod/mod-context';
	import { readable } from 'svelte/store';
	import { localStorageBackedStore } from './utils';
	import CopyableText from './CopyableText.svelte';

	export let communityName: string;

	const communityContext = getCommunityContext();
	$: communityRes = communityContext.getCommunity(communityName);
	$: communityView = $communityRes?.community_view;
	$: community = communityView?.community;
	$: moderators = $communityRes?.moderators;
	$: communityHref = community ? `/${$profile.instance}/c/${nameAtInstance(community)}` : '';
	$: userModerates = moderators?.some((mod) => mod.moderator.id === $siteMeta.my_user?.local_user_view.person.id);
	$: userIsHeadMod = moderators?.[0]?.moderator.id === $userId;
	$: warnModlog = userModerates ? $showModlogWarningModerated : $showModlogWarning;
	$: communityStats = [
		{
			label: 'Posts',
			value: communityView?.counts.posts ?? 0,
			icon: 'file-lines'
		},
		{
			label: 'Comments',
			value: communityView?.counts.comments ?? 0,
			icon: 'comments'
		},
		{
			label: 'Subscribers',
			value: communityView?.counts.subscribers ?? 0,
			icon: 'users'
		},
		{
			label: 'Daily Active Users',
			value: communityView?.counts.users_active_day ?? 0,
			icon: 'users'
		},
		{
			label: 'Weekly Active Users',
			value: communityView?.counts.users_active_week ?? 0,
			icon: 'users'
		},
		{
			label: 'Montly Active Users',
			value: communityView?.counts.users_active_month ?? 0,
			icon: 'users'
		},
		{
			label: 'Half-Year Active Users',
			value: communityView?.counts.users_active_half_year ?? 0,
			icon: 'users'
		}
	];

	$: communityInstance = community ? new URL(community.actor_id).host : null;
	$: communityAddress = community ? '!' + nameAtInstance(community, '', { alwaysShowInstance: true }) : '';

	const { siteMeta, userId } = getAppContext();
	const { showModlogWarning, showModlogWarningModerated } = getSettingsContext();
	const { hasModSeniority } = getCommunityContext();
	const modContext = getModContext();

	const descriptionOpen = localStorageBackedStore('community-sidebar-description-open', true);
	const communityDetailsOpen = localStorageBackedStore('community-sidebar-community-details-open', true);

	const userModResignPending = community
		? getModActionPending('add-mod', `${community.id}-${userId}`)
		: readable(false);

	async function resignFromModTeam() {
		if (!community) {
			return;
		}
		const communityName = nameAtInstance(community, community.title);

		if (!$userId || !$siteMeta.my_user || !confirm(`Are you sure you want to resign as a mod of "${communityName}".`)) {
			return;
		}
		const me = $siteMeta.my_user.local_user_view.person,
			myName = nameAtInstance(me, me.display_name);
		await modContext.addMod({
			added: false,
			communityId: community.id,
			personId: $userId,
			personName: myName
		});
	}
</script>
