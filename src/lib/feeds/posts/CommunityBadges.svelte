{#if badges.length}
	<Stack gap={1} dir="r" align="center" cl="sx-font-size-2">
		{#each badges as b}
			<Tooltip>
				<span slot="tooltip">{b.text}</span>
				<span class="sx-badge-{b.color} m-0 ws-nowrap">
					<span>{b.text}</span>
				</span>
			</Tooltip>
		{/each}
	</Stack>
{/if}

<script lang="ts">
	import { Tooltip, Stack } from 'sheodox-ui';
	import type { Community } from 'lemmy-js-client';

	export let community: Community;
	export let extended = false;

	$: badges = getBadges(community, extended);

	function getBadges(community: Community, extended: boolean) {
		const badges = [];

		if (community.removed) {
			badges.push({ color: 'red', text: 'Removed' });
		}
		if (community.deleted) {
			badges.push({ color: 'red', text: 'Deleted' });
		}
		if (community.nsfw) {
			badges.push({ color: 'red', text: 'NSFW' });
		}
		if (community.hidden) {
			badges.push({ color: 'blue', text: 'Hidden' });
		}
		if (extended) {
			if (community.posting_restricted_to_mods) {
				badges.push({ color: 'cyan', text: 'Mod Posts Only' });
			}
		}
		return badges;
	}
</script>
