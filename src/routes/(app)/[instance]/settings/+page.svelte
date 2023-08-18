<Stack dir="c" gap={4} align="start">
	<div class="mx-2">
		<Checkbox bind:checked={$navSidebarDocked} on:change={onSidebarDockChange}>Keep navigation sidebar open</Checkbox>
		<Checkbox bind:checked={$loadImagesAsWebp}>Load images as <code>.webp</code></Checkbox>
	</div>
	<div class="f-row gap-4 f-wrap align-items-start">
		<ThemeSettings />
	</div>
	<DescriptiveToggles legend="NSFW Thumbnails" options={NSFWHandlingOptions} bind:group={$nsfwImageHandling} />
	<FeedPostLayoutSettings />
	<FeedLayoutSettings />
</Stack>

<script lang="ts">
	import { getSettingsContext, NSFWHandlingOptions } from '$lib/settings-context';
	import { Stack, Checkbox } from 'sheodox-ui';
	import FeedLayoutSettings from '$lib/FeedLayoutSettings.svelte';
	import DescriptiveToggles from '$lib/DescriptiveToggles.svelte';
	import FeedPostLayoutSettings from './FeedPostLayoutSettings.svelte';
	import ThemeSettings from './ThemeSettings.svelte';
	import { getAppContext } from '$lib/app-context';

	const { navSidebarOpen } = getAppContext();
	const { nsfwImageHandling, navSidebarDocked, loadImagesAsWebp } = getSettingsContext();

	function onSidebarDockChange() {
		// if they want it to always show, they probably want it open right now
		$navSidebarOpen = $navSidebarDocked;
	}
</script>
