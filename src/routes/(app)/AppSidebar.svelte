<style>
	nav :global(.icon-link) {
		display: inline-grid !important;
		grid-template-columns: 2.5rem 1fr;
		align-items: center;
	}
</style>

<div>
	<nav class="sx-sidebar-simple-links">
		<Stack dir="c" gap={1}>
			{#each links as link}
				<a href={link.href} class="icon-link"><Icon icon={link.icon} /><span>{link.text}</span></a>
			{/each}

			<SidebarSubscriptionList
				title="Favorites"
				subscriptions={favoriteCommunitiesh}
				favorites={$favoriteCommunitiesIds}
				on:favorite={(e) => onFavorite(e.detail)}
			/>

			<SidebarSubscriptionList
				title="Subscriptions"
				{subscriptions}
				favorites={$favoriteCommunitiesIds}
				on:favorite={(e) => onFavorite(e.detail)}
			/>
		</Stack>
	</nav>
</div>

<script lang="ts">
	import type { CommunityFollowerView } from 'lemmy-js-client';
	import { Stack, Icon } from 'sheodox-ui';
	import SidebarSubscriptionList from './SidebarSubscriptionList.svelte';
	import { getAppContext } from '$lib/app-context';
	import { localStorageBackedStore } from '$lib/utils';

	export let subscriptions: CommunityFollowerView[] = [];

	const { username, loggedIn } = getAppContext();

	const favoriteCommunitiesIds = localStorageBackedStore<number[]>('favorite-communities', []);

	$: favoriteCommunitiesh = subscriptions.filter((sub) => $favoriteCommunitiesIds.includes(sub.community.id));

	function onFavorite({ communityId, favorite }: { communityId: number; favorite: boolean }) {
		if (favorite) {
			favoriteCommunitiesIds.update((coms) => Array.from(new Set([...coms, communityId])));
		} else {
			favoriteCommunitiesIds.update((coms) => {
				const c = new Set(coms);
				c.delete(communityId);
				return Array.from(c);
			});
		}
	}

	$: links = [
		{ href: '/', text: 'Home', icon: 'home' },
		{ href: '/search', text: 'Search', icon: 'magnifying-glass' },
		{ href: `/u/${username}`, text: 'Profile', icon: 'user', disabled: !loggedIn },
		{ href: '/communities', text: 'Communities', icon: 'users' },
		{ text: 'Settings', icon: 'cog', href: `/settings`, disabled: !loggedIn },
		{ href: '/about', text: 'About Alexandrite', icon: 'address-card' }
	].filter((f) => !f.disabled);
</script>
