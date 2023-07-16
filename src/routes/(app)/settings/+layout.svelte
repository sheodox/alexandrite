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

	$: tabs = [
		{
			title: 'Alexandrite',
			href: '/settings'
		},
		{ title: 'Lemmy', href: '/settings/lemmy' },
		{ title: 'Blocks', href: '/settings/blocks' }
	];

	let selectedTab = location.pathname;

	afterNavigate(() => {
		selectedTab = location.pathname;
	});
</script>
