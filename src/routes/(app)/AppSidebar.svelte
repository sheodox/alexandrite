<style>
	nav :global(.icon-link) {
		display: inline-grid !important;
		grid-template-columns: 2rem 1fr;
		align-items: center;
	}
</style>

<div>
	<nav class="sx-sidebar-simple-links">
		<Stack dir="c" gap={1}>
			{#each links as link}
				<a href={link.href} class="icon-link"><Icon icon={link.icon} /><span>{link.text}</span></a>
			{/each}

			{#if subscriptions.length}
				<h2 class="muted sx-font-size-4 mb-0 pl-2">Subscriptions</h2>
				{#each subs as cv}
					<CommunityLink community={cv.community} inlineLink={false} />
				{/each}
			{/if}
		</Stack>
	</nav>
</div>

<script lang="ts">
	import type { CommunityFollowerView } from 'lemmy-js-client';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import { Stack, Icon } from 'sheodox-ui';
	import { nameAtInstance } from '$lib/nav-utils';
	import { getAppContext } from '$lib/app-context';

	export let subscriptions: CommunityFollowerView[] = [];

	const { username, loggedIn } = getAppContext();

	function name(cv: CommunityFollowerView) {
		return nameAtInstance({
			name: cv.community.title ?? cv.community.name,
			local: cv.community.local,
			actor_id: cv.community.actor_id
		});
	}

	$: subs = [...subscriptions].sort((a, b) => name(a).localeCompare(name(b)));
	$: links = [
		{
			href: '/',
			text: 'Home',
			icon: 'home'
		},
		{
			href: `/u/${username}`,
			text: 'Profile',
			icon: 'user',
			disabled: !loggedIn
		},
		{
			href: '/communities',
			text: 'Communities',
			icon: 'users'
		}
	].filter((f) => !f.disabled);
</script>
