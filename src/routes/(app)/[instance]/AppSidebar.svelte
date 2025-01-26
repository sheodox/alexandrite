<style lang="scss">
	nav :global(.icon-link) {
		display: inline-grid !important;
		grid-template-columns: 2.5rem 1fr;
		align-items: center;

		:global(a) :global(*:first-child) {
			width: 2.5rem;
		}
	}

	.separator {
		border-bottom: 1px solid var(--sx-gray-transparent-light);
		width: 100%;
	}
</style>

<div>
	<Stack cl="mx-2 sx-badge-gray sx-font-size-2" dir="r" align="center" gap={1}>
		<Logo size="tiny" />
		<span class="fw-normal">Powered by</span>
		<ExternalLink href="https://github.com/sheodox/alexandrite">Alexandrite</ExternalLink>
	</Stack>
	<nav class="sx-sidebar-simple-links p-0 mt-4">
		<Stack dir="c" gap={4}>
			<div class="separator" />
			<div class="f-column gap-1 px-2">
				{#each links as link}
					<a href={link.href} class="icon-link plain-link"><Icon icon={link.icon} /> <span>{link.text}</span></a>
				{/each}
			</div>

			<div class="separator" />

			<div class="f-column gap-1 px-2">
				{#if combinedCommunityList.length > 0}
					<TextInput bind:value={communitySearch} placeholder="type name or @instance">Search Communities</TextInput>
				{/if}

				{#if communitySearch !== ''}
					<SidebarSubscriptionList
						title="Search Results"
						communities={searchCommunities(communitySearch, combinedCommunityList)}
						favorites={$favoriteCommunitiesIds}
						on:favorite={(e) => onFavorite(e.detail)}
					/>
					{#if !communitySearch.startsWith('@')}
						<a
							href="/{$profile.instance}/search?q={encodeURIComponent(communitySearch)}&type=Communities"
							class="inline-link"
						>
							Search <em>"{communitySearch}"</em>
							<Icon icon="arrow-right" />
						</a>
					{/if}
				{:else}
					<SidebarSubscriptionList
						title="Favorites"
						communities={favoriteCommunities.map((v) => v.community)}
						favorites={$favoriteCommunitiesIds}
						on:favorite={(e) => onFavorite(e.detail)}
					/>

					{#if $siteMeta.my_user}
						<SidebarSubscriptionList
							title="Moderating"
							communities={$siteMeta.my_user.moderates.map((v) => v.community)}
							favorites={$favoriteCommunitiesIds}
							on:favorite={(e) => onFavorite(e.detail)}
						/>
					{/if}

					<SidebarSubscriptionList
						title="Subscriptions"
						communities={subscriptions.map((v) => v.community)}
						favorites={$favoriteCommunitiesIds}
						on:favorite={(e) => onFavorite(e.detail)}
					/>
				{/if}
			</div>
		</Stack>
	</nav>
</div>

<script lang="ts">
	import type { Community, CommunityFollowerView } from 'lemmy-js-client';
	import { Stack, ExternalLink, Icon, TextInput } from 'sheodox-ui';
	import SidebarSubscriptionList from './SidebarSubscriptionList.svelte';
	import { getAppContext } from '$lib/app-context';
	import { localStorageBackedStore } from '$lib/utils';
	import { profile } from '$lib/profiles/profiles';
	import Logo from '$lib/Logo.svelte';

	export let subscriptions: CommunityFollowerView[] = [];

	let communitySearch = '';

	const { siteMeta } = getAppContext();

	const favoriteCommunitiesIds = localStorageBackedStore<number[]>('favorite-communities', []);

	$: favoriteCommunities = subscriptions.filter((sub) => $favoriteCommunitiesIds.includes(sub.community.id));

	$: combinedCommunityList = Array.from(
		new Map<number, Community>([
			...favoriteCommunities.map((com) => [com.community.id, com.community] as [number, Community]),
			...($siteMeta.my_user?.moderates ?? []).map((com) => [com.community.id, com.community] as [number, Community]),
			...subscriptions.map((com) => [com.community.id, com.community] as [number, Community])
		]).values()
	).sort((a, b) => {
		return (a.title ?? a.name).localeCompare(b.title ?? b.name);
	});

	function searchCommunities(searchText: string, communities: Community[]) {
		const matches = (text: string) => text.toLowerCase().includes(searchText.toLowerCase());

		return communities.filter((com) => {
			if (searchText.startsWith('@')) {
				const instanceHostname = new URL(com.actor_id).hostname;
				return instanceHostname.includes(searchText.toLowerCase().replace(/^@/, ''));
			}
			return matches(com.title) || matches(com.name);
		});
	}

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

	$: loggedIn = $profile.loggedIn;
	$: links = [
		{ href: `/${$profile.instance}`, text: 'Home', icon: 'home' },
		{ href: `/${$profile.instance}/search`, text: 'Search', icon: 'magnifying-glass' },
		{ href: `/${$profile.instance}/u/${$profile.username}`, text: 'Profile', icon: 'user', disabled: !loggedIn },
		{ href: `/${$profile.instance}/communities`, text: 'Communities', icon: 'users' },
		{ text: 'Settings', icon: 'cog', href: `/${$profile.instance}/settings` },
		{ href: '/about', text: 'About Alexandrite', icon: 'address-card' },
		{ text: 'Help', icon: 'question-circle', href: '/help', as: 'a' }
	].filter((f) => !f.disabled);
</script>
