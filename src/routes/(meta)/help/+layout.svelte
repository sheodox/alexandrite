<Layout size="narrow">
	<Stack dir="c" gap={2}>
		<h1 class="mb-0">Help</h1>

		<LinkTabList {tabs} {selectedTab} />

		<slot />
	</Stack>
</Layout>

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { Layout, LinkTabList, Stack } from 'sheodox-ui';

	$: tabs = [
		{
			title: 'General',
			href: `/help`
		},
		{
			title: 'Hotkeys',
			href: `/help/hotkeys`
		}
	];

	let selectedTab = location.pathname;

	afterNavigate(() => {
		selectedTab = location.pathname;
	});
</script>
