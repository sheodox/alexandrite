<style>
</style>

<div>
	<nav class="sx-sidebar-simple-links">
		<Stack dir="c" gap={1}>
			{#each links as link}
				<a href={link.href}><Icon icon={link.icon} />{link.text}</a>
			{/each}

			<h2 class="muted sx-font-size-4 mb-0 pl-2">Subscriptions</h2>
			{#each subs as cv}
				<CommunityLink community={cv.community} />
			{/each}
		</Stack>
	</nav>
</div>

<script lang="ts">
	import type { CommunityFollowerView } from 'lemmy-js-client';
	import CommunityLink from '$lib/CommunityLink.svelte';
	import { Stack, Icon } from 'sheodox-ui';
	import { nameAtInstance } from '$lib/nav-utils';

	export let subscriptions: CommunityFollowerView[];

	function name(cv: CommunityFollowerView) {
		return nameAtInstance({
			name: cv.community.title ?? cv.community.name,
			local: cv.community.local,
			actor_id: cv.community.actor_id
		});
	}

	$: subs = [...subscriptions].sort((a, b) => name(a).localeCompare(name(b)));
	const links = [
		{
			href: '/',
			text: 'Home',
			icon: 'home'
		},
		{
			href: '/communities',
			text: 'Communities',
			icon: 'users'
		}
	];
</script>
