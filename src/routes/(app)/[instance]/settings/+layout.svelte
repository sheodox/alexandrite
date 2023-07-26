<style>
	div :global(h2) {
		margin-top: var(--sx-spacing-6);
		margin-bottom: var(--sx-spacing-2);
	}
</style>

<Title title="Settings" />
<Layout size="medium">
	<h1>Settings</h1>
	<LinkTabList {tabs} {selectedTab} />
	<div class="mt-4">
		<slot />
	</div>
</Layout>

<script lang="ts">
	import { Layout, LinkTabList } from 'sheodox-ui';
	import Title from '$lib/Title.svelte';
	import { afterNavigate } from '$app/navigation';
	import { profile } from '$lib/profiles/profiles';

	$: tabs = [
		{
			title: 'Alexandrite',
			href: `/${$profile.instance}/settings`
		},
		{ title: 'Lemmy', href: `/${$profile.instance}/settings/lemmy` },
		{ title: 'Blocks', href: `/${$profile.instance}/settings/blocks` }
	];

	let selectedTab = location.pathname;

	afterNavigate(() => {
		selectedTab = location.pathname;
	});
</script>
