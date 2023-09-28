<style>
	li {
		flex-basis: 2.5rem;
	}
</style>

<li>
	<Stack dir="r" gap={2} justify="between" align="center" cl="px-2 f-1">
		<UserLink user={mod.moderator} showAvatarFallback />
		<ExtraActions {actions} small />
	</Stack>
</li>

<script lang="ts">
	import { Stack } from 'sheodox-ui';
	import UserLink from '$lib/UserLink.svelte';
	import type { CommunityModeratorView } from 'lemmy-js-client';
	import { nameAtInstance } from '$lib/nav-utils';
	import ExtraActions from '$lib/ExtraActions.svelte';
	import type { ExtraAction } from '$lib/utils';
	import { getModActionPending, getModContext } from '$lib/mod/mod-context';
	import { getAppContext } from '$lib/app-context';
	import { profile } from '$lib/profiles/profiles';

	export let mod: CommunityModeratorView;
	export let hasSeniority: boolean;

	let actions: ExtraAction[];
	const modContext = getModContext();
	const { userId } = getAppContext();

	$: isMe = $userId === mod.moderator.id;

	const modAddPending = getModActionPending('add-mod', `${mod.community.id}-${mod.moderator.id}`);
	async function removeMod() {
		await modContext.addMod({
			added: false,
			personName: nameAtInstance(mod.moderator, mod.moderator.display_name),
			personId: mod.moderator.id,
			communityId: mod.community.id
		});
	}

	$: actions = [
		...(isMe || !$profile.loggedIn
			? []
			: [
					{
						icon: 'message',
						text: `Send message`,
						href: `/${$profile.instance}/message/${mod.moderator.id}`
					}
			  ]),
		...(!hasSeniority
			? []
			: [
					{
						disabled: !hasSeniority,
						icon: 'user-minus',
						text: `Remove moderator ${nameAtInstance(mod.moderator, mod.moderator.display_name)}`,
						busy: $modAddPending,
						click: removeMod
					}
			  ])
	];
</script>
