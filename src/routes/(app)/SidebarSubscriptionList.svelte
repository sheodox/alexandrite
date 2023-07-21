{#if coms.length}
	<h2 class="muted sx-font-size-4 mb-0 pl-2">{title}</h2>
	<Stack dir="c" gap={1}>
		{#each coms as community}
			{@const favorited = favorites.includes(community.id)}
			<SidebarSub {community} {favorited} on:favorite />
		{/each}
	</Stack>
{/if}

<script lang="ts">
	import type { Community } from 'lemmy-js-client';
	import { nameAtInstance } from '$lib/nav-utils';
	import { Stack } from 'sheodox-ui';
	import SidebarSub from './SidebarSub.svelte';

	export let title: string;
	export let communities: Community[];
	export let favorites: number[];

	function name(com: Community) {
		return nameAtInstance({
			name: com.title ?? com.name,
			local: com.local,
			actor_id: com.actor_id
		});
	}

	$: coms = [...communities].sort((a, b) => name(a).localeCompare(name(b)));
</script>
