{#if subscriptions.length}
	<h2 class="muted sx-font-size-4 mb-0 pl-2">{title}</h2>
	<Stack dir="c" gap={1}>
		{#each subs as sub}
			{@const favorited = favorites.includes(sub.community.id)}
			<SidebarSub {sub} {favorited} on:favorite />
		{/each}
	</Stack>
{/if}

<script lang="ts">
	import type { CommunityFollowerView } from 'lemmy-js-client';
	import { nameAtInstance } from '$lib/nav-utils';
	import { Stack } from 'sheodox-ui';
	import SidebarSub from './SidebarSub.svelte';

	export let title: string;
	export let subscriptions: CommunityFollowerView[];
	export let favorites: number[];

	function name(cv: CommunityFollowerView) {
		return nameAtInstance({
			name: cv.community.title ?? cv.community.name,
			local: cv.community.local,
			actor_id: cv.community.actor_id
		});
	}

	$: subs = [...subscriptions].sort((a, b) => name(a).localeCompare(name(b)));
</script>
