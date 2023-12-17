{#if badges.length}
	<span class="sx-font-size-2 f-row">
		{#each badges as b}
			<Tooltip>
				<span slot="tooltip">{b.text}</span>
				<span class="sx-badge-{b.color} ws-nowrap">
					<span>{b.text}</span>
				</span>
			</Tooltip>
		{/each}
	</span>
{/if}

<script lang="ts">
	import { Tooltip } from 'sheodox-ui';
	import type { Community, Person } from 'lemmy-js-client';
	import { profile } from '$lib/profiles/profiles';
	import { getCommunityContext } from '$lib/community-context/community-context';
	import { nameAtInstance } from '$lib/nav-utils';
	import { getAppContext } from '$lib/app-context';

	$: username = $profile.username;
	const { siteMeta } = getAppContext();

	export let user: Person;
	export let postOP: string | boolean | undefined = ''; // actor_id of someone who made a post
	export let bannedFromCommunity: boolean | undefined = undefined;
	// the community this user posted in, used for checking if they're a mod
	export let community: Community | undefined = undefined;

	const communityContext = getCommunityContext();
	$: com = community ? communityContext.weaklyGetCommunity(nameAtInstance(community)) : null;
	$: isMod = $com?.moderators.some((mod) => mod.moderator.actor_id === user.actor_id);
	$: isAdmin = $siteMeta.admins.some((admin) => admin.person.actor_id === user.actor_id);

	$: badges = (function () {
		const badges = [];

		// TODO make this just use IDs, compare to user's ID from siteMeta in app context
		if ((typeof postOP === 'string' && user.actor_id === postOP) || (typeof postOP === 'boolean' && postOP)) {
			badges.push({ color: 'peach', text: 'OP' });
		}
		if (user.banned) {
			badges.push({ color: 'red', text: 'Banned' });
		}
		if (bannedFromCommunity) {
			badges.push({ color: 'red', text: 'Banned (Community)' });
		}
		if (user.deleted) {
			badges.push({ color: 'red', text: 'Deleted' });
		}
		if (user.bot_account) {
			badges.push({ color: 'cyan', text: 'Bot' });
		}
		if (isAdmin) {
			badges.push({ color: 'orange', text: 'Admin' });
		}
		if (isMod) {
			badges.push({ color: 'green', text: 'Mod' });
		}
		if (user.local && user.name == username) {
			badges.push({ color: 'mint', text: 'You' });
		}
		return badges;
	})();
</script>
