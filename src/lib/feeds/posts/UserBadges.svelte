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
	import type { Person } from 'lemmy-js-client';
	import { getAppContext } from '$lib/app-context';

	const { username } = getAppContext();

	export let user: Person;
	export let postOP = ''; // actor_id of someone who made a post

	$: badges = getBadges(user);

	function getBadges(user: Person) {
		const badges = [];

		if (user.banned) {
			badges.push({ color: 'red', text: 'Banned' });
		}
		if (user.deleted) {
			badges.push({ color: 'red', text: 'Deleted' });
		}
		if (user.bot_account) {
			badges.push({ color: 'cyan', text: 'Bot' });
		}
		if (user.admin) {
			badges.push({ color: 'orange', text: 'Admin' });
		}
		if (user.actor_id === postOP) {
			badges.push({ color: 'pink', text: 'OP' });
		}
		if (user.local && user.name == username) {
			badges.push({ color: 'mint', text: 'You' });
		}
		return badges;
	}
</script>
