<article>
	{#if community && communityView}
		<Sidebar description={community.description ?? ''} bannerImageSrc={community.banner} context="Community">
			<a href={communityHref} slot="name">
				<NameAtInstance place={community} prefix="!" />
			</a>

			<div slot="actions">
				<Stack dir="c" gap={2}>
					{#if communityView}
						<CommunityCounts {communityView} />
					{/if}
					<Stack dir="r" gap={2} align="center">
						<ExternalLink href={community.actor_id} cl="inline-link">
							<Icon icon="arrow-up-right-from-square" />
							View on {communityInstance}
						</ExternalLink>
					</Stack>
				</Stack>
			</div>
			<div slot="end">
				<Stack dir="c" gap={2}>
					{#if moderators}
						<Accordion buttonClasses="tertiary">
							<span slot="title">Moderation</span>
							<Stack dir="c" gap={2}>
								<Stack dir="r" gap={2} align="center" justify="between">
									<h3 class="m-0">Moderators</h3>
									<ModlogLink
										communityId={community.id}
										highlight={userModerates ?? false}
										highlightColor="green"
										warn={warnModlog}
									/>
								</Stack>
								<ul class="p-0 hover-list" style="list-style: none">
									{#each moderators as mod}
										<ModeratorRow hasSeniority={hasModSeniority(moderators, mod.moderator.id)} {mod} />
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
				</Stack>
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

	$: communityInstance = community ? new URL(community.actor_id).host : null;

	const { siteMeta, userId } = getAppContext();
	const { showModlogWarning, showModlogWarningModerated } = getSettingsContext();
	const { hasModSeniority } = getCommunityContext();
	const modContext = getModContext();

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
